import { BrowserWindow } from 'electron'
import type { BrowserWindow as BrowserWindowType, WebContents } from 'electron'

export const getSenderWindow = (sender: WebContents) => {
  return BrowserWindow.fromWebContents(sender)
}

export const attachWindowDevDiagnostics = (window: BrowserWindowType) => {
  const { webContents } = window

  webContents.on('console-message', details => {
    console.log(`[renderer:${details.level}] ${details.message} (${details.sourceId}:${details.lineNumber})`)
  })

  webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[renderer:load-fail] ${errorCode} ${errorDescription} ${validatedURL}`)
  })

  webContents.on('render-process-gone', (_event, details) => {
    console.error('[renderer:gone]', details)
  })

  webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error(`[preload:error] ${preloadPath}`, error)
  })
}
