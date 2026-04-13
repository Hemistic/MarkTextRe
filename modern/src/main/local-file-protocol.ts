import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { protocol } from 'electron'

export const LOCAL_FILE_PROTOCOL = 'marktext-file'
const WINDOWS_DRIVE_HOST_REG = /^[a-z]$/i
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.apng': 'image/apng',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

export const resolveLocalFileRequestUrl = (requestUrl: string) => {
  const url = new URL(requestUrl)
  const { hostname, pathname, search, hash } = url

  if (WINDOWS_DRIVE_HOST_REG.test(hostname)) {
    return `file:///${hostname.toUpperCase()}:${pathname}${search}${hash}`
  }

  if (hostname) {
    return `file://${hostname}${pathname}${search}${hash}`
  }

  return `file://${pathname}${search}${hash}`
}

export const resolveLocalFileRequestPath = (requestUrl: string) => {
  return fileURLToPath(resolveLocalFileRequestUrl(requestUrl))
}

const getContentType = (filePath: string) => {
  return CONTENT_TYPE_BY_EXTENSION[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

export const registerLocalFileProtocolScheme = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: LOCAL_FILE_PROTOCOL,
      privileges: {
        corsEnabled: true,
        secure: true,
        standard: true,
        stream: true,
        supportFetchAPI: true
      }
    }
  ])
}

export const installLocalFileProtocol = () => {
  protocol.handle(LOCAL_FILE_PROTOCOL, async request => {
    const filePath = resolveLocalFileRequestPath(request.url)

    try {
      const content = await readFile(filePath)
      return new Response(content, {
        headers: {
          'cache-control': 'no-store',
          'content-type': getContentType(filePath)
        },
        status: 200
      })
    } catch (error) {
      console.error('[modern] local file protocol failed', {
        filePath,
        requestUrl: request.url,
        resolvedUrl: resolveLocalFileRequestUrl(request.url)
      }, error)

      return new Response(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
  })
}
