import { afterAll, beforeAll, describe, expect, it } from 'vitest'

type ImageInfo = {
  isUnknownType: boolean
  src: string
}

type NetworkSupportModule = {
  getImageInfo: (src: string, baseUrl?: string) => ImageInfo
}

const originalWindow = (globalThis as typeof globalThis & { window?: Window }).window

let networkSupport: NetworkSupportModule

const setWindowContext = (protocol: string, userAgent = 'win32', marktext: unknown = undefined) => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      marktext,
      location: { protocol },
      navigator: {
        platform: 'Win32',
        userAgent
      }
    }
  })
}

describe('legacy networkSupport getImageInfo', () => {
  beforeAll(async () => {
    setWindowContext('file:')

    // @ts-expect-error importing legacy JS from the repo root for compatibility coverage.
    networkSupport = await import('../../../../../src/muya/lib/utils/networkSupport.js')
  })

  afterAll(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow
    })
  })

  it('maps absolute Windows image paths to Vite fs URLs in dev renderer', () => {
    setWindowContext('http:')

    expect(networkSupport.getImageInfo('C:\\Users\\tester\\Pictures\\demo image.png')).toEqual({
      isUnknownType: false,
      src: '/@fs/C:/Users/tester/Pictures/demo%20image.png'
    })
  })

  it('maps absolute Windows image paths to the Electron local scheme in the app renderer', () => {
    setWindowContext('http:', 'Mozilla/5.0 Electron/41.0.0', {})

    expect(networkSupport.getImageInfo('C:\\Users\\tester\\Pictures\\demo image.png')).toEqual({
      isUnknownType: false,
      src: 'marktext-file:///C:/Users/tester/Pictures/demo image.png'
    })
  })

  it('maps file protocol image paths to Vite fs URLs in dev renderer', () => {
    setWindowContext('http:')

    expect(networkSupport.getImageInfo('file:///C:/Users/tester/Pictures/demo%20image.png')).toEqual({
      isUnknownType: false,
      src: '/@fs/C:/Users/tester/Pictures/demo%20image.png'
    })
  })

  it('keeps file protocol image paths outside the dev renderer bridge', () => {
    setWindowContext('file:')

    expect(networkSupport.getImageInfo('C:\\Users\\tester\\Pictures\\demo image.png')).toEqual({
      isUnknownType: false,
      src: 'file:///C:/Users/tester/Pictures/demo image.png'
    })
  })
})
