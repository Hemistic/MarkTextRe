import path from 'path'
import { URL_REG, DATA_URL_REG, IMAGE_EXT_REG } from '../config'

const TIMEOUT = 1500

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
  const runtimeDirname = typeof globalThis !== 'undefined'
    ? globalThis.DIRNAME
    : undefined
  const resolvedBaseUrl = baseUrl ?? runtimeDirname
  const imageExtension = IMAGE_EXT_REG.test(src)
  const isUrl = URL_REG.test(src) || (imageExtension && /^file:\/\/.+/.test(src))

  if (imageExtension) {
    const isAbsoluteLocal = /^(?:\/|\\\\|[a-zA-Z]:\\|[a-zA-Z]:\/).+/.test(src)

    if (isUrl || (!isAbsoluteLocal && !resolvedBaseUrl)) {
      if (!isUrl && !resolvedBaseUrl) {
        console.warn('"baseUrl" is not defined!')
      }

      return {
        isUnknownType: false,
        src
      }
    }

    return {
      isUnknownType: false,
      src: 'file://' + path.resolve(resolvedBaseUrl, src)
    }
  } else if (isUrl && !imageExtension) {
    return {
      isUnknownType: true,
      src
    }
  }

  if (DATA_URL_REG.test(src)) {
    return {
      isUnknownType: false,
      src
    }
  }

  return {
    isUnknownType: false,
    src: ''
  }
}
