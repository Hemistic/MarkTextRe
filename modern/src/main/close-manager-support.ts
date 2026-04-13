import type { BrowserWindow } from 'electron'
import type {
  DirtyDocumentSummary,
  WindowCloseRequest,
  WindowCloseRequestKind,
  WindowCloseResponse
} from '@shared/contracts'

interface CloseEventLike {
  preventDefault: () => void
}

interface WindowCloseEventHandlerOptions {
  beginPendingClose: (windowId: number) => boolean
  finishPendingClose: (windowId: number) => void
  handleWindowCloseRequest: (window: BrowserWindow) => Promise<void>
  shouldAllowNativeClose: (windowId: number) => boolean
}

type WindowCloseFlowHandlerDependencies = Omit<
  WindowCloseEventHandlerOptions,
  'handleWindowCloseRequest'
>

interface WindowClosedHandlerOptions {
  cleanupWindow: (windowId: number) => void
  cleanupWindowRequests: (windowId: number) => void
}

export const createWindowCloseRequestSender = (channel: string) => {
  return (
    window: Pick<BrowserWindow, 'webContents'>,
    request: WindowCloseRequest
  ) => {
    window.webContents.send(channel, request)
  }
}

export const requestWindowCloseAction = (
  window: BrowserWindow,
  kind: WindowCloseRequestKind,
  beginRequest: (
    windowId: number,
    requestKind: WindowCloseRequestKind,
    sendRequest: (request: WindowCloseRequest) => void
  ) => Promise<WindowCloseResponse>,
  sendRequest: (window: BrowserWindow, request: WindowCloseRequest) => void
) => {
  return beginRequest(window.id, kind, request => {
    sendRequest(window, request)
  })
}

export const resolveDirtyDocumentsResponse = (
  response: WindowCloseResponse,
  logError: (message: string, error: string) => void
) => {
  if (Array.isArray(response.dirtyDocuments)) {
    return response.dirtyDocuments
  }

  if (response.error) {
    logError('[main] failed to get dirty documents from renderer:', response.error)
  }

  return [] as DirtyDocumentSummary[]
}

export const resolveSaveAllDirtyDocumentsResponse = (
  response: WindowCloseResponse,
  logError: (message: string, error: string) => void
) => {
  if (!response.ok && response.error) {
    logError('[main] failed to save dirty documents before closing:', response.error)
  }

  return response.ok
}

export const createFinalizeWindowClose = (
  markClosing: (windowId: number) => void
) => {
  return (window: BrowserWindow) => {
    markClosing(window.id)
    window.close()
  }
}

export const createWindowCloseFlowHandler = (
  handleWindowCloseRequest: (window: BrowserWindow) => Promise<void>,
  dependencies: WindowCloseFlowHandlerDependencies
) => {
  return (window: BrowserWindow) => {
    return createWindowCloseEventHandler(window, {
      ...dependencies,
      handleWindowCloseRequest
    })
  }
}

export const createWindowCloseEventHandler = (
  window: BrowserWindow,
  {
    beginPendingClose,
    finishPendingClose,
    handleWindowCloseRequest,
    shouldAllowNativeClose
  }: WindowCloseEventHandlerOptions
) => {
  const windowId = window.id

  return (event: CloseEventLike) => {
    if (shouldAllowNativeClose(windowId)) {
      return
    }

    event.preventDefault()

    if (!beginPendingClose(windowId)) {
      return
    }

    void handleWindowCloseRequest(window).finally(() => {
      finishPendingClose(windowId)
    })
  }
}

export const createWindowClosedHandler = (
  windowId: number,
  {
    cleanupWindow,
    cleanupWindowRequests
  }: WindowClosedHandlerOptions
) => {
  return () => {
    cleanupWindow(windowId)
    cleanupWindowRequests(windowId)
  }
}

export const createWindowCloseResponseHandler = (
  getSenderWindow: (sender: Electron.WebContents) => BrowserWindow | null,
  resolveRequest: (windowId: number, response: WindowCloseResponse) => boolean
) => {
  return (event: Electron.IpcMainEvent, response: WindowCloseResponse) => {
    return handleWindowCloseResponse(
      event.sender,
      response,
      getSenderWindow,
      resolveRequest
    )
  }
}

export const handleWindowCloseResponse = (
  sender: Electron.WebContents,
  response: WindowCloseResponse,
  getSenderWindow: (sender: Electron.WebContents) => BrowserWindow | null,
  resolveRequest: (windowId: number, response: WindowCloseResponse) => boolean
) => {
  const window = getSenderWindow(sender)
  if (!window) {
    return false
  }

  return resolveRequest(window.id, response)
}
