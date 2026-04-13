import type { BrowserWindow, WebContents } from 'electron'

export const toggleWindowMaximize = (
  window: Pick<BrowserWindow, 'isMaximized' | 'maximize' | 'unmaximize'>
) => {
  if (window.isMaximized()) {
    window.unmaximize()
    return 'unmaximized' as const
  }

  window.maximize()
  return 'maximized' as const
}

export const toggleWebContentsDevTools = (
  webContents: Pick<WebContents, 'isDestroyed' | 'isDevToolsOpened' | 'closeDevTools' | 'openDevTools'> | null | undefined
) => {
  if (!webContents || webContents.isDestroyed()) {
    return false
  }

  if (webContents.isDevToolsOpened()) {
    webContents.closeDevTools()
    return true
  }

  webContents.openDevTools({ mode: 'detach' })
  return true
}
