import { ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import type { SaveDocumentInput } from '@shared/contracts'
import { registerIpcHandleMap } from './ipc-registration-support'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import {
  openMarkdownDocument,
  saveMarkdownDocument,
  tryOpenMarkdownDocument
} from './markdown-documents'
import {
  readRecentDocuments,
  removeRecentDocument
} from './recent-documents'
import {
  showOpenMarkdownDialog,
  showSaveMarkdownDialog
} from './dialogs'
import { refreshApplicationMenu } from './menu'

export const registerFileIpcHandlers = () => {
  registerIpcHandleMap(ipcMain.handle.bind(ipcMain), {
    [MAIN_IPC_CHANNELS.files.getRecentDocuments]: async () => readRecentDocuments(),
    [MAIN_IPC_CHANNELS.files.removeRecentDocument]: async (_event: IpcMainInvokeEvent, pathname: string) => {
      await removeRecentDocument(pathname)
      await refreshApplicationMenu()
    },
    [MAIN_IPC_CHANNELS.files.openMarkdown]: async () => {
      const pathname = await showOpenMarkdownDialog()
      if (!pathname) {
        return null
      }

      const document = await openMarkdownDocument(pathname)
      await refreshApplicationMenu()
      return document
    },
    [MAIN_IPC_CHANNELS.files.openMarkdownAtPath]: async (_event: IpcMainInvokeEvent, pathname: string) => {
      const document = await tryOpenMarkdownDocument(pathname)
      await refreshApplicationMenu()
      return document
    },
    [MAIN_IPC_CHANNELS.files.saveMarkdown]: async (_event: IpcMainInvokeEvent, input: SaveDocumentInput) => {
      let pathname = input.pathname

      if (!pathname) {
        pathname = await showSaveMarkdownDialog(input.filename)
        if (!pathname) {
          return null
        }
      }

      const document = await saveMarkdownDocument(pathname, input.markdown)
      await refreshApplicationMenu()
      return document
    },
    [MAIN_IPC_CHANNELS.files.saveMarkdownAs]: async (_event: IpcMainInvokeEvent, input: SaveDocumentInput) => {
      const pathname = await showSaveMarkdownDialog(input.filename)
      if (!pathname) {
        return null
      }

      const document = await saveMarkdownDocument(pathname, input.markdown)
      await refreshApplicationMenu()
      return document
    }
  })
}
