import {
  getDirtyTabIds,
  OPEN_UNAVAILABLE_STATUS,
  RECENT_FILE_OPEN_FAILED_STATUS,
  REOPEN_UNAVAILABLE_STATUS,
  SAVE_AS_UNAVAILABLE_STATUS,
  SAVE_UNAVAILABLE_STATUS,
  openDocumentFromPicker,
  reopenDocumentFromPath,
  saveTabDocument
} from './files'
import {
  closePreparedTabInState,
  setStatusInState
} from './state'
import {
  applySavedTabWithTracking,
  resolveDirtyCloseResult
} from './commandSupport'
import {
  findTabById,
  handleMissingRecentDocumentInState,
  openTrackedDocumentInState
} from './commandsSupport'
import {
  closeTabInWorkspace
} from './workspace'
import type {
  EditorCommandState
} from './commands'
import type { EditorTab } from './types'
import type {
  EditorCommandsRuntimeServices
} from './commandsRuntimeServices'

type RefreshRecentDocuments = () => Promise<void>

const createFileRuntimeServices = (
  runtimeServices: EditorCommandsRuntimeServices
) => ({
  openMarkdown: runtimeServices.openMarkdown,
  openMarkdownAtPath: runtimeServices.openMarkdownAtPath,
  saveMarkdown: runtimeServices.saveMarkdown,
  saveMarkdownAs: runtimeServices.saveMarkdownAs
})

const createRecentRuntimeServices = (
  runtimeServices: EditorCommandsRuntimeServices
) => ({
  removeRecentDocument: runtimeServices.removeRecentDocument
})

export const ensureBridgeCommandAvailable = (
  status: EditorCommandState['status'],
  available: boolean,
  unavailableStatus: string
) => {
  if (available) {
    return true
  }

  setStatusInState(status, unavailableStatus)
  return false
}

export const openDocumentWorkflow = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  runtimeServices: EditorCommandsRuntimeServices
) => {
  if (!ensureBridgeCommandAvailable(state.status, runtimeServices.bridgeAvailable(), OPEN_UNAVAILABLE_STATUS)) {
    return
  }

  const document = await openDocumentFromPicker(createFileRuntimeServices(runtimeServices))
  if (!document) {
    return
  }

  await openTrackedDocumentInState(state, refreshRecentDocuments, document)
}

export const reopenRecentDocumentWorkflow = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  pathname: string,
  runtimeServices: EditorCommandsRuntimeServices
) => {
  if (!ensureBridgeCommandAvailable(state.status, runtimeServices.bridgeAvailable(), REOPEN_UNAVAILABLE_STATUS)) {
    return
  }

  const document = await reopenDocumentFromPath(pathname, createFileRuntimeServices(runtimeServices))
  if (!document) {
    await handleMissingRecentDocumentInState(
      state.status,
      refreshRecentDocuments,
      pathname,
      RECENT_FILE_OPEN_FAILED_STATUS,
      createRecentRuntimeServices(runtimeServices)
    )
    return
  }

  await openTrackedDocumentInState(state, refreshRecentDocuments, document)
}

export const saveDocumentWorkflow = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  saveAs: boolean,
  runtimeServices: EditorCommandsRuntimeServices
) => {
  if (!ensureBridgeCommandAvailable(
    state.status,
    runtimeServices.bridgeAvailable(),
    saveAs ? SAVE_AS_UNAVAILABLE_STATUS : SAVE_UNAVAILABLE_STATUS
  )) {
    return null
  }

  const current = findTabById(state.tabs.value, id)
  if (!current) {
    return null
  }

  const nextTab = await saveTabDocument(current, saveAs, createFileRuntimeServices(runtimeServices))
  if (!nextTab) {
    return null
  }

  await applySavedTabWithTracking(state, refreshRecentDocuments, current.id, nextTab)
  setStatusInState(state.status, saveAs ? `Saved as ${nextTab.filename}` : `Saved ${nextTab.filename}`)
  return nextTab
}

export const saveAllDirtyDocumentsWorkflow = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  saveDocumentInState: (id: string) => Promise<EditorTab | null>
) => {
  const dirtyTabIds = getDirtyTabIds(state.tabs.value)

  for (const tabId of dirtyTabIds) {
    const savedTab = await saveDocumentInState(tabId)
    if (!savedTab) {
      return false
    }
  }

  return true
}

export const closeDocumentTabWorkflow = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  runtimeServices: EditorCommandsRuntimeServices,
  saveDocumentInState: () => Promise<EditorTab | null>
) => {
  const current = findTabById(state.tabs.value, id)
  if (!current) {
    return
  }

  const { closingId } = await resolveDirtyCloseResult(
    current,
    runtimeServices.confirmCloseDocument,
    saveDocumentInState
  )

  if (!closingId) {
    return
  }

  const nextState = closeTabInWorkspace(state.tabs.value, state.activeTabId.value, closingId)
  if (!nextState) {
    return
  }

  closePreparedTabInState(state, nextState)
}
