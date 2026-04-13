import { app, BrowserWindow } from 'electron'
import { registerIpcHandlers } from './ipc'
import { installApplicationMenu } from './menu'
import {
  installLocalFileProtocol,
  registerLocalFileProtocolScheme
} from './local-file-protocol'
import { createOpenPathCoordinator } from './open-paths'
import { createMainWindow } from './window'

let mainWindow: BrowserWindow | null = null
registerLocalFileProtocolScheme()
const openPathCoordinator = createOpenPathCoordinator({
  createWindow: createMainWindow,
  getWindow: () => mainWindow,
  setWindow: window => {
    mainWindow = window
  }
})

const bootstrap = async () => {
  registerIpcHandlers()
  await installApplicationMenu()
  mainWindow = await createMainWindow()
  openPathCoordinator.attachWindow(mainWindow)
}

const hasSingleInstanceLock = openPathCoordinator.acquireSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
}

openPathCoordinator.registerAppEventHandlers()

app.whenReady().then(async () => {
  installLocalFileProtocol()
  await openPathCoordinator.captureStartupPaths(process.argv)
  await bootstrap()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow().then(window => {
        mainWindow = window
        openPathCoordinator.attachWindow(window)
      })
    }
  })
})

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
