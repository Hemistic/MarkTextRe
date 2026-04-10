import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createMainWindow = () => {
  const preloadPath = path.join(__dirname, 'index.mjs')
  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  const isDev = Boolean(devServerUrl)

  const window = new BrowserWindow({
    width: 1360,
    height: 880,
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
    window.show()
  })

  if (isDev) {
    window.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`)
    })

    window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error(`[renderer:load-fail] ${errorCode} ${errorDescription} ${validatedURL}`)
    })

    window.webContents.on('render-process-gone', (_event, details) => {
      console.error('[renderer:gone]', details)
    })

    window.webContents.on('preload-error', (_event, preloadPath, error) => {
      console.error(`[preload:error] ${preloadPath}`, error)
    })
  }

  if (isDev) {
    void window.loadURL(devServerUrl as string)
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return window
}
