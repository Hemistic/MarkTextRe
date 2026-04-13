import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow } from 'electron'
import { installWindowCloseHandler } from './close-manager'
import { attachWindowContextMenu, attachWindowDevDiagnostics } from './webcontents'
import {
  createMainWindowOptions,
  getRendererLoadTarget,
  resolvePreloadPath
} from './window-support'
import { applyWindowSettings } from './window-settings'
import {
  getInitialWindowState,
  installWindowStatePersistence
} from './window-state'
import { readSettingsState } from './settings-storage'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createMainWindow = async () => {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  const isDev = Boolean(devServerUrl)
  const preloadPath = resolvePreloadPath({
    isDev,
    currentDirname: __dirname
  })
  const initialWindowState = await getInitialWindowState()
  const settings = await readSettingsState()

  const window = new BrowserWindow(createMainWindowOptions({
    initialBounds: initialWindowState.bounds,
    isDev,
    platform: process.platform,
    preloadPath,
    titleBarStyle: settings.titleBarStyle
  }))

  window.once('ready-to-show', () => {
    if (initialWindowState.isMaximized) {
      window.maximize()
    }
    window.show()
  })

  installWindowCloseHandler(window)
  installWindowStatePersistence(window)
  attachWindowContextMenu(window)
  applyWindowSettings(window, settings)

  if (isDev) {
    attachWindowDevDiagnostics(window)
  }

  const loadTarget = getRendererLoadTarget({
    currentDirname: __dirname,
    devServerUrl: devServerUrl ?? undefined
  })

  if (loadTarget.kind === 'url') {
    void window.loadURL(loadTarget.target)
  } else {
    void window.loadFile(loadTarget.target)
  }

  return window
}
