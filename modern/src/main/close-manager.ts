import { randomUUID } from 'node:crypto'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import type {
  DirtyDocumentSummary,
  WindowCloseRequest,
  WindowCloseResponse
} from '@shared/contracts'
import { IPC_CHANNELS } from '@shared/ipc'
import { getSenderWindow } from './webcontents'

const dirtyWindows = new Map<number, boolean>()
const closingWindows = new Set<number>()
const pendingCloseWindows = new Set<number>()
const pendingRequests = new Map<string, {
  windowId: number
  resolve: (response: WindowCloseResponse) => void
  timeout: NodeJS.Timeout
}>()

let closeCoordinatorRegistered = false

const cleanupPendingRequestsForWindow = (windowId: number) => {
  for (const [requestId, pendingRequest] of pendingRequests.entries()) {
    if (pendingRequest.windowId !== windowId) {
      continue
    }

    clearTimeout(pendingRequest.timeout)
    pendingRequest.resolve({
      requestId,
      ok: false,
      error: 'Window closed before renderer responded.'
    })
    pendingRequests.delete(requestId)
  }
}

const requestRendererCloseAction = (window: BrowserWindow, kind: WindowCloseRequest['kind']) => {
  const requestId = randomUUID()

  return new Promise<WindowCloseResponse>(resolve => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      resolve({
        requestId,
        ok: false,
        error: `Timed out while waiting for renderer to handle "${kind}".`
      })
    }, 8000)

    pendingRequests.set(requestId, {
      windowId: window.id,
      resolve,
      timeout
    })

    window.webContents.send(IPC_CHANNELS.app.windowCloseRequest, {
      requestId,
      kind
    } satisfies WindowCloseRequest)
  })
}

const getDirtyDocuments = async (window: BrowserWindow) => {
  if (!dirtyWindows.get(window.id)) {
    return [] as DirtyDocumentSummary[]
  }

  const response = await requestRendererCloseAction(window, 'get-dirty-documents')

  if (!Array.isArray(response.dirtyDocuments)) {
    if (response.error) {
      console.error('[main] failed to get dirty documents from renderer:', response.error)
    }
    return [] as DirtyDocumentSummary[]
  }

  return response.dirtyDocuments
}

const saveAllDirtyDocuments = async (window: BrowserWindow) => {
  const response = await requestRendererCloseAction(window, 'save-all-dirty-documents')

  if (!response.ok && response.error) {
    console.error('[main] failed to save dirty documents before closing:', response.error)
  }

  return response.ok
}

const showUnsavedChangesDialog = async (window: BrowserWindow, dirtyDocuments: DirtyDocumentSummary[]) => {
  const detailLines = dirtyDocuments.length === 0
    ? ['There are unsaved documents in this window.']
    : dirtyDocuments.slice(0, 6).map(document => `- ${document.filename}`)

  if (dirtyDocuments.length > 6) {
    detailLines.push(`- ...and ${dirtyDocuments.length - 6} more`)
  }

  const result = await dialog.showMessageBox(window, {
    type: 'warning',
    buttons: ['Save All', 'Discard', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
    title: 'Unsaved Changes',
    message: dirtyDocuments.length === 1
      ? `${dirtyDocuments[0].filename} has unsaved changes.`
      : 'There are unsaved documents in this window.',
    detail: `${detailLines.join('\n')}\n\nSave changes before closing the window?`
  })

  if (result.response === 0) {
    return 'save'
  }

  if (result.response === 1) {
    return 'discard'
  }

  return 'cancel'
}

const finalizeWindowClose = (window: BrowserWindow) => {
  closingWindows.add(window.id)
  window.close()
}

const handleWindowClose = async (window: BrowserWindow) => {
  const dirtyDocuments = await getDirtyDocuments(window)
  const decision = await showUnsavedChangesDialog(window, dirtyDocuments)

  if (decision === 'cancel') {
    return
  }

  if (decision === 'save') {
    const saved = await saveAllDirtyDocuments(window)
    if (!saved) {
      await dialog.showMessageBox(window, {
        type: 'info',
        buttons: ['OK'],
        defaultId: 0,
        noLink: true,
        title: 'Close Canceled',
        message: 'The window was not closed because some documents were not saved.',
        detail: 'Finish saving the remaining documents, then try closing the window again.'
      })
      return
    }
  }

  finalizeWindowClose(window)
}

export const registerCloseCoordinator = () => {
  if (closeCoordinatorRegistered) {
    return
  }

  closeCoordinatorRegistered = true

  ipcMain.on(IPC_CHANNELS.app.windowCloseResponse, (event, response: WindowCloseResponse) => {
    const pendingRequest = pendingRequests.get(response.requestId)
    if (!pendingRequest) {
      return
    }

    const window = getSenderWindow(event.sender)
    if (!window || window.id !== pendingRequest.windowId) {
      return
    }

    clearTimeout(pendingRequest.timeout)
    pendingRequests.delete(response.requestId)
    pendingRequest.resolve(response)
  })
}

export const setWindowDirtyState = (window: BrowserWindow, hasDirtyDocuments: boolean) => {
  dirtyWindows.set(window.id, hasDirtyDocuments)
}

export const installWindowCloseHandler = (window: BrowserWindow) => {
  const windowId = window.id

  window.on('close', event => {
    if (closingWindows.has(windowId)) {
      return
    }

    if (!dirtyWindows.get(windowId)) {
      return
    }

    event.preventDefault()

    if (pendingCloseWindows.has(windowId)) {
      return
    }

    pendingCloseWindows.add(windowId)

    void handleWindowClose(window).finally(() => {
      pendingCloseWindows.delete(windowId)
    })
  })

  window.on('closed', () => {
    dirtyWindows.delete(windowId)
    closingWindows.delete(windowId)
    pendingCloseWindows.delete(windowId)
    cleanupPendingRequestsForWindow(windowId)
  })
}
