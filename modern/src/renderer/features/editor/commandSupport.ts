import type { ComputedRef, Ref } from 'vue'
import type { EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  addRecentDocumentToState,
  openPreparedDocumentInState,
  replaceSavedTabInState
} from './state'

type RefreshRecentDocuments = () => Promise<void>

export interface RecentTrackingState {
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
  tabs: Ref<EditorTab[]>
  viewMode: Ref<EditorViewMode>
}

export interface DirtyCloseResult {
  closingId: string | null
  savedTab: EditorTab | null
}

export const trackRecentDocumentInState = async (
  recentDocuments: Ref<RecentDocument[]>,
  refreshRecentDocuments: RefreshRecentDocuments,
  document: EditorDocument
) => {
  addRecentDocumentToState(recentDocuments, document)
  await refreshRecentDocuments()
}

export const openPreparedDocumentWithTracking = async (
  state: RecentTrackingState,
  refreshRecentDocuments: RefreshRecentDocuments,
  document: EditorTab,
  statusText: string
) => {
  openPreparedDocumentInState(
    state.tabs,
    state.activeDocument,
    state.activeTabId,
    state.viewMode,
    state.status,
    document,
    statusText
  )
  await trackRecentDocumentInState(state.recentDocuments, refreshRecentDocuments, document)
}

export const applySavedTabWithTracking = async (
  state: RecentTrackingState,
  refreshRecentDocuments: RefreshRecentDocuments,
  currentId: string,
  nextTab: EditorTab
) => {
  replaceSavedTabInState(state.tabs, state.activeTabId, state.viewMode, currentId, nextTab)
  await trackRecentDocumentInState(state.recentDocuments, refreshRecentDocuments, nextTab)
}

export const resolveDirtyCloseResult = async (
  current: EditorTab,
  confirmCloseDocument: (filename: string) => Promise<'save' | 'discard' | 'cancel'>,
  saveDocument: () => Promise<EditorTab | null>
): Promise<DirtyCloseResult> => {
  if (!current.dirty) {
    return {
      closingId: current.id,
      savedTab: null
    }
  }

  const decision = await confirmCloseDocument(current.filename)

  if (decision === 'cancel') {
    return {
      closingId: null,
      savedTab: null
    }
  }

  if (decision === 'discard') {
    return {
      closingId: current.id,
      savedTab: null
    }
  }

  const savedTab = await saveDocument()
  return {
    closingId: savedTab?.id ?? null,
    savedTab
  }
}
