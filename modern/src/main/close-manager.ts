import { BrowserWindow, ipcMain } from 'electron'
import type { DirtyDocumentSummary } from '@shared/contracts'
import { MAIN_IPC_CHANNELS } from './ipc-contract'
import { handleWindowCloseRequest } from './close-flow'
import { createCloseRequestRegistry } from './close-request-registry'
import { getSenderWindow } from './webcontents'
import { showCloseCanceledDialog, showUnsavedChangesDialog } from './close-dialogs'
import { createWindowCloseState } from './window-close-state'
import {
  createFinalizeWindowClose,
  createWindowCloseFlowHandler,
  createWindowClosedHandler,
  createWindowCloseRequestSender,
  createWindowCloseResponseHandler,
  requestWindowCloseAction,
  resolveDirtyDocumentsResponse,
  resolveSaveAllDirtyDocumentsResponse
} from './close-manager-support'

const closeRequestRegistry = createCloseRequestRegistry()
const closeState = createWindowCloseState()

let closeCoordinatorRegistered = false

const sendWindowCloseRequest = createWindowCloseRequestSender(MAIN_IPC_CHANNELS.app.windowCloseRequest)

const requestRendererCloseAction = (
  window: BrowserWindow,
  kind: 'get-dirty-documents' | 'save-all-dirty-documents'
) => {
  return requestWindowCloseAction(window, kind, closeRequestRegistry.beginRequest, sendWindowCloseRequest)
}

const getDirtyDocuments = async (window: BrowserWindow) => {
  if (!closeState.hasDirtyDocuments(window.id)) {
    return [] as DirtyDocumentSummary[]
  }

  const response = await requestRendererCloseAction(window, 'get-dirty-documents')
  return resolveDirtyDocumentsResponse(response, console.error)
}

const saveAllDirtyDocuments = async (window: BrowserWindow) => {
  const response = await requestRendererCloseAction(window, 'save-all-dirty-documents')
  return resolveSaveAllDirtyDocumentsResponse(response, console.error)
}

const finalizeWindowClose = createFinalizeWindowClose(closeState.markClosing)

export const registerCloseCoordinator = () => {
  if (closeCoordinatorRegistered) {
    return
  }

  closeCoordinatorRegistered = true

  ipcMain.on(
    MAIN_IPC_CHANNELS.app.windowCloseResponse,
    createWindowCloseResponseHandler(getSenderWindow, closeRequestRegistry.resolveRequest)
  )
}

export const setWindowDirtyState = (window: BrowserWindow, hasDirtyDocuments: boolean) => {
  closeState.setDirtyState(window.id, hasDirtyDocuments)
}

export const installWindowCloseHandler = (window: BrowserWindow) => {
  const windowId = window.id
  const handleCloseFlow = (targetWindow: BrowserWindow) => handleWindowCloseRequest(targetWindow, {
    finalizeWindowClose,
    getDirtyDocuments,
    saveAllDirtyDocuments,
    showCloseCanceledDialog,
    showUnsavedChangesDialog
  })
  const onClose = createWindowCloseFlowHandler(handleCloseFlow, {
    beginPendingClose: closeState.beginPendingClose,
    finishPendingClose: closeState.finishPendingClose,
    shouldAllowNativeClose: closeState.shouldAllowNativeClose
  })(window)
  const onClosed = createWindowClosedHandler(windowId, {
    cleanupWindow: closeState.cleanupWindow,
    cleanupWindowRequests: closeRequestRegistry.cleanupWindowRequests
  })

  window.on('close', onClose)
  window.on('closed', onClosed)
}
