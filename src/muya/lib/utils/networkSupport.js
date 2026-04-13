import path from 'path'
import { URL_REG, DATA_URL_REG, IMAGE_EXT_REG } from '../config'

const TIMEOUT = 1500
const ABSOLUTE_LOCAL_REG = /^(?:\/|\\\\|[a-zA-Z]:\\|[a-zA-Z]:\/).+/
const WINDOWS_LOCAL_REG = /^(?:[a-zA-Z]:\\|[a-zA-Z]:\/).+/
const WINDOWS_UNC_REG = /^\\\\\?\\.+/
const FILE_PROTOCOL_REG = /^file:\/\/.+/
const HTTP_PROTOCOL_REG = /^https?:$/
const ELECTRON_USER_AGENT_REG = /Electron/i

const toFileProtocolSrc = src => {
  if (!src || DATA_URL_REG.test(src) || URL_REG.test(src) || FILE_PROTOCOL_REG.test(src)) {
    return src
  }

  if (WINDOWS_LOCAL_REG.test(src)) {
    return 'file:///' + src.replace(/\\/g, '/')
  }

  if (WINDOWS_UNC_REG.test(src)) {
    return 'file:///' + src.substring(4).replace(/\\/g, '/')
  }

  if (/^\/.+/.test(src)) {
    return 'file://' + src
  }

  return src
}

const fromFileProtocolSrc = src => {
  if (!FILE_PROTOCOL_REG.test(src)) {
    return src
  }

  if (/^file:\/\/\/[a-zA-Z]:\//.test(src)) {
    return decodeURIComponent(src.replace(/^file:\/\/\//, ''))
  }

  return decodeURIComponent(src.replace(/^file:\/\//, ''))
}

const isDevHttpRenderer = () => {
  return typeof window !== 'undefined' &&
    window.location &&
    HTTP_PROTOCOL_REG.test(window.location.protocol)
}

const isElectronRenderer = () => {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.marktext) {
    return true
  }

  return typeof navigator !== 'undefined' &&
    ELECTRON_USER_AGENT_REG.test(navigator.userAgent || '')
}

const toBrowserAccessibleSrc = src => {
  const fileProtocolSrc = toFileProtocolSrc(src)

  if (isElectronRenderer()) {
    return fileProtocolSrc.replace(/^file:/, 'marktext-file:')
  }

  if (!isDevHttpRenderer()) {
    return fileProtocolSrc
  }

  const absolutePath = fromFileProtocolSrc(fileProtocolSrc)

  if (!ABSOLUTE_LOCAL_REG.test(absolutePath)) {
    return fileProtocolSrc
  }

  const normalizedPath = absolutePath.replace(/\\/g, '/')
  const fsPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`

  return encodeURI(`/@fs${fsPath}`)
}

export const loadImage = async (url, detectContentType = false) => {
  if (detectContentType) {
    const isImage = await checkImageContentType(url)
    if (!isImage) throw new Error('not an image')
  }
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        url,
        width: image.width,
        height: image.height
      })
    }
    image.onerror = err => {
      reject(err)
    }
    image.src = url
  })
}

export const isOnline = () => {
  return navigator.onLine === true
}

export const getPageTitle = url => {
  if (!url.startsWith('http') || !isOnline()) {
    return ''
  }

  const req = new XMLHttpRequest()
  let settle
  const promise = new Promise(resolve => {
    settle = resolve
  })
  const handler = () => {
    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 200) {
        const contentType = req.getResponseHeader('Content-Type')
        if (/text\/html/.test(contentType)) {
          const { response } = req
          if (typeof response === 'string') {
            const match = response.match(/<title>(.*)<\/title>/)
            return match && match[1] ? settle(match[1]) : settle('')
          }
        }
      }
      return settle('')
    }
  }
  req.open('GET', url)
  req.onreadystatechange = handler
  req.onerror = () => settle('')
  req.send()

  const timer = new Promise(resolve => {
    setTimeout(() => {
      resolve('')
    }, TIMEOUT)
  })

  return Promise.race([promise, timer])
}

export const checkImageContentType = url => {
  const req = new XMLHttpRequest()
  let settle
  const promise = new Promise(resolve => {
    settle = resolve
  })
  const handler = () => {
    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 200) {
        const contentType = req.getResponseHeader('Content-Type')
        if (/^image\/(?:jpeg|png|gif|svg\+xml|webp)$/.test(contentType)) {
          settle(true)
        } else {
          settle(false)
        }
      } else if (req.status === 405) {
        settle(true)
      } else {
        settle(false)
      }
    }
  }
  req.open('HEAD', url)
  req.onreadystatechange = handler
  req.onerror = () => settle(false)
  req.send()

  return promise
}

export const getImageInfo = (src, baseUrl) => {
  if (typeof src !== 'string' || !src) {
    return {
      isUnknownType: false,
      src: ''
    }
  }

  if (DATA_URL_REG.test(src)) {
    return {
      isUnknownType: false,
      src
    }
  }

  const runtimeDirname = typeof globalThis !== 'undefined'
    ? globalThis.DIRNAME
    : undefined
  const resolvedBaseUrl = baseUrl ?? runtimeDirname
  const imageExtension = IMAGE_EXT_REG.test(src)
  const isUrl = URL_REG.test(src) || (imageExtension && FILE_PROTOCOL_REG.test(src))

  if (imageExtension) {
    const isAbsoluteLocal = ABSOLUTE_LOCAL_REG.test(src)

    if (isUrl) {
      return {
        isUnknownType: false,
        src: FILE_PROTOCOL_REG.test(src)
          ? toBrowserAccessibleSrc(src)
          : src
      }
    }

    if (isAbsoluteLocal) {
      return {
        isUnknownType: false,
        src: toBrowserAccessibleSrc(src)
      }
    }

    if (!resolvedBaseUrl) {
      console.warn('"baseUrl" is not defined!')
      return {
        isUnknownType: false,
        src
      }
    }

    return {
      isUnknownType: false,
      src: toBrowserAccessibleSrc(path.resolve(resolvedBaseUrl, src))
    }
  } else if (isUrl && !imageExtension) {
    return {
      isUnknownType: true,
      src
    }
  }

  return {
    isUnknownType: false,
    src: ''
  }
}
