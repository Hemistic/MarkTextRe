import type { ComputedRef, Ref } from 'vue'
import type { EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
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
  addRecentDocumentToState,
  openPreparedDocumentInState,
  replaceTabInState
} from './state'
import {
  closeTabInWorkspace,
  resolveActiveDocument,
  resolveViewMode
} from './workspace'
import {
  confirmCloseDocument
} from '../../services/app'
import { hasMarkTextBridge } from '../../services/api'
import { removeRecentDocument } from '../../services/files'

interface EditorCommandState {
  tabs: Ref<EditorTab[]>
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  viewMode: Ref<EditorViewMode>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
}

type RefreshRecentDocuments = () => Promise<void>

const addRecentDocument = (
  recentDocuments: Ref<RecentDocument[]>,
  document: EditorDocument
) => {
  addRecentDocumentToState(recentDocuments, document)
}

export const openDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments
) => {
  if (!hasMarkTextBridge()) {
    state.status.value = OPEN_UNAVAILABLE_STATUS
    return
  }

  const document = await openDocumentFromPicker()
  if (!document) {
    return
  }

  openPreparedDocumentInState(
    state.tabs,
    state.activeDocument,
    state.activeTabId,
    state.viewMode,
    state.status,
    document,
    `Opened ${document.filename}`
  )
  addRecentDocument(state.recentDocuments, document)
  await refreshRecentDocuments()
}

export const reopenRecentDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  pathname: string
) => {
  if (!hasMarkTextBridge()) {
    state.status.value = REOPEN_UNAVAILABLE_STATUS
    return
  }

  const document = await reopenDocumentFromPath(pathname)
  if (!document) {
    await removeRecentDocument(pathname)
    await refreshRecentDocuments()
    state.status.value = RECENT_FILE_OPEN_FAILED_STATUS
    return
  }

  openPreparedDocumentInState(
    state.tabs,
    state.activeDocument,
    state.activeTabId,
    state.viewMode,
    state.status,
    document,
    `Opened ${document.filename}`
  )
  addRecentDocument(state.recentDocuments, document)
  await refreshRecentDocuments()
}

export const saveDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  saveAs = false
) => {
  if (!hasMarkTextBridge()) {
    state.status.value = saveAs ? SAVE_AS_UNAVAILABLE_STATUS : SAVE_UNAVAILABLE_STATUS
    return null
  }

  const current = state.tabs.value.find(tab => tab.id === id)
  if (!current) {
    return null
  }

  const nextTab = await saveTabDocument(current, saveAs)
  if (!nextTab) {
    return null
  }

  replaceTabInState(state.tabs, state.activeTabId, current.id, nextTab)
  addRecentDocument(state.recentDocuments, nextTab)
  state.status.value = saveAs ? `Saved as ${nextTab.filename}` : `Saved ${nextTab.filename}`
  state.viewMode.value = resolveViewMode(resolveActiveDocument(state.tabs.value, state.activeTabId.value))
  await refreshRecentDocuments()
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
  id: string
) => {
  const current = state.tabs.value.find(tab => tab.id === id)
  if (!current) {
    return
  }

  let closingId = id

  if (current.dirty) {
    const decision = await confirmCloseDocument(current.filename)

    if (decision === 'cancel') {
      return
    }

    if (decision === 'save') {
      const savedTab = await saveDocumentInState(state, refreshRecentDocuments, id)
      if (!savedTab) {
        return
      }

      closingId = savedTab.id
    }
  }

  const nextState = closeTabInWorkspace(state.tabs.value, state.activeTabId.value, closingId)
  if (!nextState) {
    return
  }

  state.tabs.value = nextState.tabs
  state.activeTabId.value = nextState.activeTabId
  state.viewMode.value = nextState.viewMode
  state.status.value = `Closed ${nextState.closedTab.filename}`
}
