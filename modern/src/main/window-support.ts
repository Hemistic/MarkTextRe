import path from 'node:path'
import type { BrowserWindowConstructorOptions } from 'electron'
import type { TitleBarStyle } from '@shared/contracts'

export const resolvePreloadPath = (options: {
  isDev: boolean
  currentDirname: string
}) => {
  const { isDev, currentDirname } = options
  return isDev
    ? path.resolve(currentDirname, '../src/preload/preload.cjs')
    : path.join(currentDirname, 'preload.cjs')
}

export const createMainWindowOptions = (options: {
  initialBounds: Pick<BrowserWindowConstructorOptions, 'width' | 'height' | 'x' | 'y'>
  isDev: boolean
  platform: NodeJS.Platform
  preloadPath: string
  titleBarStyle: TitleBarStyle
}): BrowserWindowConstructorOptions => {
  const { initialBounds, platform, preloadPath, titleBarStyle } = options

  const shouldUseCustomFrame = platform !== 'darwin' && titleBarStyle !== 'native'

  return {
    ...initialBounds,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#f4f1e8',
    frame: platform === 'darwin' ? true : !shouldUseCustomFrame,
    titleBarStyle: platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      spellcheck: true
    }
  }
}

export const getRendererLoadTarget = (options: {
  currentDirname: string
  devServerUrl?: string
}) => {
  const { currentDirname, devServerUrl } = options

  if (devServerUrl) {
    return {
      kind: 'url' as const,
      target: devServerUrl
    }
  }

  return {
    kind: 'file' as const,
    target: path.join(currentDirname, '../dist/index.html')
  }
}
