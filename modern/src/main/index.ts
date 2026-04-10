import { app, BrowserWindow } from 'electron'
import { registerIpcHandlers } from './ipc'
import { createMainWindow } from './window'

let mainWindow: ReturnType<typeof createMainWindow> | null = null

const bootstrap = async () => {
  registerIpcHandlers()
  mainWindow = createMainWindow()
}

app.whenReady().then(() => {
  void bootstrap()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
