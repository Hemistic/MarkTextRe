import { ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { registerIpcHandleMap } from './ipc-registration-support'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { toggleWebContentsDevTools, toggleWindowMaximize } from './window-command-support'
import { getSenderWindow } from './webcontents'

export const registerWindowIpcHandlers = () => {
  registerIpcHandleMap(ipcMain.handle.bind(ipcMain), {
    [MAIN_IPC_CHANNELS.window.minimize]: (event: IpcMainInvokeEvent) => {
      getSenderWindow(event.sender)?.minimize()
    },
    [MAIN_IPC_CHANNELS.window.maximize]: (event: IpcMainInvokeEvent) => {
      const window = getSenderWindow(event.sender)
      if (!window) {
        return
      }

      toggleWindowMaximize(window)
    },
    [MAIN_IPC_CHANNELS.window.close]: (event: IpcMainInvokeEvent) => {
      const window = getSenderWindow(event.sender)
      if (!window || window.isDestroyed()) {
        return
      }

      window.close()
    },
    [MAIN_IPC_CHANNELS.window.toggleDevTools]: (event: IpcMainInvokeEvent) => {
      const window = getSenderWindow(event.sender)
      toggleWebContentsDevTools(window?.webContents)
    }
  })
}
