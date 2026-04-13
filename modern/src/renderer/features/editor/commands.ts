import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
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
  openPreparedDocumentWithTracking,
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
import {
  createEditorCommandsRuntimeServices,
  type EditorCommandsRuntimeServices
} from './commandsRuntimeServices'

export interface EditorCommandState {
  tabs: Ref<EditorTab[]>
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  viewMode: Ref<EditorViewMode>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
}

type RefreshRecentDocuments = () => Promise<void>

const createFileRuntimeServices = (
  runtimeServices: EditorCommandsRuntimeServices
) => ({
  openMarkdown: runtimeServices.openMarkdown,
  openMarkdownAtPath: runtimeServices.openMarkdownAtPath,
  saveMarkdown: runtimeServices.saveMarkdown,
  saveMarkdownAs: runtimeServices.saveMarkdownAs
})

const createCommandSupportRuntimeServices = (
  runtimeServices: EditorCommandsRuntimeServices
) => ({
  removeRecentDocument: runtimeServices.removeRecentDocument
})

export const openDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  if (!runtimeServices.bridgeAvailable()) {
    setStatusInState(state.status, OPEN_UNAVAILABLE_STATUS)
    return
  }

  const document = await openDocumentFromPicker(createFileRuntimeServices(runtimeServices))
  if (!document) {
    return
  }

  await openTrackedDocumentInState(state, refreshRecentDocuments, document)
}

export const reopenRecentDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  pathname: string,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  if (!runtimeServices.bridgeAvailable()) {
    setStatusInState(state.status, REOPEN_UNAVAILABLE_STATUS)
    return
  }

  const document = await reopenDocumentFromPath(pathname, createFileRuntimeServices(runtimeServices))
  if (!document) {
    await handleMissingRecentDocumentInState(
      state.status,
      refreshRecentDocuments,
      pathname,
      RECENT_FILE_OPEN_FAILED_STATUS,
      createCommandSupportRuntimeServices(runtimeServices)
    )
    return
  }

  await openTrackedDocumentInState(state, refreshRecentDocuments, document)
}

export const saveDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  saveAs = false,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  if (!runtimeServices.bridgeAvailable()) {
    setStatusInState(state.status, saveAs ? SAVE_AS_UNAVAILABLE_STATUS : SAVE_UNAVAILABLE_STATUS)
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

export const saveAllDirtyDocumentsInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments
) => {
  const dirtyTabIds = getDirtyTabIds(state.tabs.value)

  for (const tabId of dirtyTabIds) {
    const savedTab = await saveDocumentInState(state, refreshRecentDocuments, tabId)
    if (!savedTab) {
      return false
    }
  }

  return true
}

export const closeDocumentTabInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  const current = findTabById(state.tabs.value, id)
  if (!current) {
    return
  }

  const { closingId } = await resolveDirtyCloseResult(
    current,
    runtimeServices.confirmCloseDocument,
    () => saveDocumentInState(state, refreshRecentDocuments, id, false, runtimeServices)
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
