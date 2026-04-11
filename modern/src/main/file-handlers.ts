import { ipcMain } from 'electron'
import type { SaveDocumentInput } from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'
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
  ipcMain.handle(IPC_CHANNELS.files.getRecentDocuments, async () => {
    return readRecentDocuments()
  })

  ipcMain.handle(IPC_CHANNELS.files.removeRecentDocument, async (_event, pathname: string) => {
    await removeRecentDocument(pathname)
    await refreshApplicationMenu()
  })

  ipcMain.handle(IPC_CHANNELS.files.openMarkdown, async () => {
    const pathname = await showOpenMarkdownDialog()
    if (!pathname) {
      return null
    }

    const document = await openMarkdownDocument(pathname)
    await refreshApplicationMenu()
    return document
  })

  ipcMain.handle(IPC_CHANNELS.files.openMarkdownAtPath, async (_event, pathname: string) => {
    const document = await tryOpenMarkdownDocument(pathname)
    await refreshApplicationMenu()
    return document
  })

  ipcMain.handle(IPC_CHANNELS.files.saveMarkdown, async (_event, input: SaveDocumentInput) => {
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
  })

  ipcMain.handle(IPC_CHANNELS.files.saveMarkdownAs, async (_event, input: SaveDocumentInput) => {
    const pathname = await showSaveMarkdownDialog(input.filename)
    if (!pathname) {
      return null
    }

    const document = await saveMarkdownDocument(pathname, input.markdown)
    await refreshApplicationMenu()
    return document
  })
}
