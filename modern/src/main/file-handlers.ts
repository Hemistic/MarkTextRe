import type { IpcMainInvokeEvent } from 'electron'
import type { LocalImageProcessInput, SaveDocumentInput } from '@shared/contracts'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { legacyMainCommandAdapter } from './app-command-dispatcher'
import { attachPendingOpenPathFlush } from './open-path-coordinator-support'
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
  showOpenImageDialog,
  showOpenPathDialog,
  showOpenDirectoryDialog,
  showOpenMarkdownDialog,
  showSaveMarkdownDialog
} from './dialogs'
import { refreshApplicationMenu } from './menu'
import { buildProjectTree } from './project-tree'
import { processLocalImage } from './image-assets'
import { createMainWindow } from './window'

const openPathInNewWindow = async (pathname: string) => {
  const window = await createMainWindow()

  attachPendingOpenPathFlush(window, () => {
    legacyMainCommandAdapter.dispatchOpenPath(pathname, window)
  })

  return true
}

const openFolderInNewWindow = async (pathname: string) => {
  const window = await createMainWindow()

  attachPendingOpenPathFlush(window, () => {
    legacyMainCommandAdapter.dispatchOpenFolder(pathname, window)
  })

  return true
}

const openFolderTree = async (pathname: string) => {
  try {
    return await buildProjectTree(pathname)
  } catch {
    return null
  }
}

export const createFileIpcHandlers = () => ({
  [MAIN_IPC_CHANNELS.files.getRecentDocuments]: async () => readRecentDocuments(),
  [MAIN_IPC_CHANNELS.files.removeRecentDocument]: async (_event: IpcMainInvokeEvent, pathname: string) => {
    await removeRecentDocument(pathname)
    await refreshApplicationMenu()
  },
  [MAIN_IPC_CHANNELS.files.pickOpenPaths]: async () => {
    return showOpenPathDialog()
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
  [MAIN_IPC_CHANNELS.files.openMarkdownInNewWindow]: async () => {
    const pathname = await showOpenMarkdownDialog()
    if (!pathname) {
      return false
    }

    await openPathInNewWindow(pathname)
    await refreshApplicationMenu()
    return true
  },
  [MAIN_IPC_CHANNELS.files.openMarkdownAtPath]: async (_event: IpcMainInvokeEvent, pathname: string) => {
    const document = await tryOpenMarkdownDocument(pathname)
    await refreshApplicationMenu()
    return document
  },
  [MAIN_IPC_CHANNELS.files.openMarkdownAtPathInNewWindow]: async (_event: IpcMainInvokeEvent, pathname: string) => {
    const document = await tryOpenMarkdownDocument(pathname)
    if (!document) {
      await refreshApplicationMenu()
      return false
    }

    await openPathInNewWindow(pathname)
    await refreshApplicationMenu()
    return true
  },
  [MAIN_IPC_CHANNELS.files.openFolder]: async () => {
    const pathname = await showOpenDirectoryDialog()
    if (!pathname) {
      return null
    }

    return openFolderTree(pathname)
  },
  [MAIN_IPC_CHANNELS.files.openFolderAtPath]: async (_event: IpcMainInvokeEvent, pathname: string) => {
    return openFolderTree(pathname)
  },
  [MAIN_IPC_CHANNELS.files.openFolderInNewWindow]: async () => {
    const pathname = await showOpenDirectoryDialog()
    if (!pathname) {
      return false
    }

    const tree = await openFolderTree(pathname)
    if (!tree) {
      return false
    }

    await openFolderInNewWindow(pathname)
    return true
  },
  [MAIN_IPC_CHANNELS.files.openFolderAtPathInNewWindow]: async (_event: IpcMainInvokeEvent, pathname: string) => {
    const tree = await openFolderTree(pathname)
    if (!tree) {
      return false
    }

    await openFolderInNewWindow(pathname)
    return true
  },
  [MAIN_IPC_CHANNELS.files.pickImage]: async () => {
    return showOpenImageDialog()
  },
  [MAIN_IPC_CHANNELS.files.processLocalImage]: async (
    _event: IpcMainInvokeEvent,
    input: LocalImageProcessInput
  ) => {
    return processLocalImage(input)
  },
  [MAIN_IPC_CHANNELS.files.saveMarkdown]: async (_event: IpcMainInvokeEvent, input: SaveDocumentInput) => {
    let pathname = input.pathname

    if (!pathname) {
      pathname = await showSaveMarkdownDialog(input.filename)
      if (!pathname) {
        return null
      }
    }

    const document = await saveMarkdownDocument(pathname, input)
    await refreshApplicationMenu()
    return document
  },
  [MAIN_IPC_CHANNELS.files.saveMarkdownAs]: async (_event: IpcMainInvokeEvent, input: SaveDocumentInput) => {
    const pathname = await showSaveMarkdownDialog(input.filename)
    if (!pathname) {
      return null
    }

    const document = await saveMarkdownDocument(pathname, input)
    await refreshApplicationMenu()
    return document
  }
})
