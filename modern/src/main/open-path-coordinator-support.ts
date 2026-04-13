import type { BrowserWindow } from 'electron'
import type { AppCommandMessage } from '@shared/contracts'

type WindowFactory = () => Promise<BrowserWindow>
type WindowGetter = () => BrowserWindow | null
type WindowSetter = (window: BrowserWindow) => void
type OpenPathDispatcher = (message: AppCommandMessage, targetWindow: BrowserWindow) => void

export const flushPendingOpenPathsToWindow = (
  pendingOpenPaths: string[],
  window: BrowserWindow,
  dispatchAppCommand: OpenPathDispatcher
) => {
  if (pendingOpenPaths.length === 0) {
    return
  }

  const pathnames = pendingOpenPaths.splice(0, pendingOpenPaths.length)
  for (const pathname of pathnames) {
    dispatchAppCommand({
      command: 'open-path',
      pathname
    }, window)
  }
}

export const attachPendingOpenPathFlush = (
  window: BrowserWindow,
  flushPendingOpenPaths: () => void
) => {
  if (window.webContents.isLoadingMainFrame()) {
    window.webContents.once('did-finish-load', flushPendingOpenPaths)
    return
  }

  flushPendingOpenPaths()
}

export const ensureOpenPathWindow = async (
  getWindow: WindowGetter,
  createWindow: WindowFactory,
  setWindow: WindowSetter
) => {
  const existingWindow = getWindow()
  if (existingWindow && !existingWindow.isDestroyed()) {
    return existingWindow
  }

  const nextWindow = await createWindow()
  setWindow(nextWindow)
  return nextWindow
}

export const activateOpenPathWindow = (window: BrowserWindow) => {
  if (window.isMinimized()) {
    window.restore()
  }

  window.focus()
}
