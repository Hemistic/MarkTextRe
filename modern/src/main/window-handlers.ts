import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import { getSenderWindow } from './webcontents'

export const registerWindowIpcHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.window.minimize, event => {
    getSenderWindow(event.sender)?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.window.maximize, event => {
    const window = getSenderWindow(event.sender)
    if (!window) {
      return
    }

    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.window.close, event => {
    const window = getSenderWindow(event.sender)
    if (!window || window.isDestroyed()) {
      return
    }

    window.close()
  })
}
