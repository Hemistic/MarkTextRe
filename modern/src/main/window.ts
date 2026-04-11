import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow } from 'electron'
import { installWindowCloseHandler } from './close-manager'
import { attachWindowDevDiagnostics } from './webcontents'
import {
  getInitialWindowState,
  installWindowStatePersistence
} from './window-state'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createMainWindow = async () => {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  const isDev = Boolean(devServerUrl)
  const preloadPath = isDev
    ? path.resolve(__dirname, '../src/preload/preload.cjs')
    : path.join(__dirname, 'preload.cjs')
  const initialWindowState = await getInitialWindowState()

  const window = new BrowserWindow({
    ...initialWindowState.bounds,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#f4f1e8',
    frame: process.platform === 'darwin',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true
    }
  })

  window.once('ready-to-show', () => {
    if (initialWindowState.isMaximized) {
      window.maximize()
    }
    window.show()
  })

  installWindowCloseHandler(window)
  installWindowStatePersistence(window)

  if (isDev) {
    attachWindowDevDiagnostics(window)
  }

  if (isDev) {
    void window.loadURL(devServerUrl as string)
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return window
}
