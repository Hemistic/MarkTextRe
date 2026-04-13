import { ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import type {
  CloseDocumentAction,
  EditorSessionState
} from '@shared/contracts'
import { createBootstrapPayload } from './app-handler-support'
import { registerIpcHandleMap } from './ipc-registration-support'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { setWindowDirtyState } from './close-manager'
import { showDocumentCloseConfirmation } from './dialogs'
import {
  readSessionState,
  sanitizeSessionState,
  writeSessionState
} from './session-storage'
import { getSenderWindow } from './webcontents'

export const registerAppIpcHandlers = () => {
  registerIpcHandleMap(ipcMain.handle.bind(ipcMain), {
    [MAIN_IPC_CHANNELS.app.getBootstrap]: () => createBootstrapPayload(),
    [MAIN_IPC_CHANNELS.app.setDirtyState]: (event: IpcMainInvokeEvent, hasDirtyDocuments: boolean) => {
      const window = getSenderWindow(event.sender)
      if (window) {
        setWindowDirtyState(window, hasDirtyDocuments)
      }
    },
    [MAIN_IPC_CHANNELS.app.getSessionState]: async () => readSessionState(),
    [MAIN_IPC_CHANNELS.app.setSessionState]: async (_event: IpcMainInvokeEvent, sessionState: EditorSessionState) => {
      const sanitized = sanitizeSessionState(sessionState)
      if (!sanitized) {
        return
      }

      await writeSessionState(sanitized)
    },
    [MAIN_IPC_CHANNELS.app.confirmCloseDocument]: async (
      event: IpcMainInvokeEvent,
      filename: string
    ): Promise<CloseDocumentAction> => {
      const window = getSenderWindow(event.sender)
      return showDocumentCloseConfirmation(window, filename)
    }
  })
}
