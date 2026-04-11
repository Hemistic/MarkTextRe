import { ipcMain } from 'electron'
import type {
  CloseDocumentAction,
  EditorSessionState
} from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'
import { setWindowDirtyState } from './close-manager'
import { showDocumentCloseConfirmation } from './dialogs'
import {
  readSessionState,
  sanitizeSessionState,
  writeSessionState
} from './session-storage'
import { getSenderWindow } from './webcontents'

export const registerAppIpcHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.app.getBootstrap, () => {
    return {
      appName: 'MarkText Modern',
      platform: process.platform,
      versions: {
        chrome: process.versions.chrome,
        electron: process.versions.electron,
        node: process.versions.node,
        v8: process.versions.v8
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.app.setDirtyState, (event, hasDirtyDocuments: boolean) => {
    const window = getSenderWindow(event.sender)
    if (window) {
      setWindowDirtyState(window, hasDirtyDocuments)
    }
  })

  ipcMain.handle(IPC_CHANNELS.app.getSessionState, async () => {
    return readSessionState()
  })

  ipcMain.handle(IPC_CHANNELS.app.setSessionState, async (_event, sessionState: EditorSessionState) => {
    const sanitized = sanitizeSessionState(sessionState)
    if (!sanitized) {
      return
    }

    await writeSessionState(sanitized)
  })

  ipcMain.handle(IPC_CHANNELS.app.confirmCloseDocument, async (event, filename: string): Promise<CloseDocumentAction> => {
    const window = getSenderWindow(event.sender)
    return showDocumentCloseConfirmation(window, filename)
  })
}
