import type { IpcMainInvokeEvent } from 'electron'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { toggleWebContentsDevTools, toggleWindowMaximize } from './window-command-support'
import { getSenderWindow } from './webcontents'

export const createWindowIpcHandlers = () => ({
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
