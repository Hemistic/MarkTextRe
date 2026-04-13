import type { Ref } from 'vue'
import type { EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import type { RestoredEditorState } from './session'
import {
  type ClosedTabResult,
  type PreparedDocumentResult,
  addRecentDocumentEntry
} from './workspace'
import {
  closePreparedTabInWorkspaceState,
  createTabInWorkspaceState,
  focusTabInState,
  openPreparedDocumentInWorkspaceState,
  openSampleDocumentInWorkspaceState,
  replaceActiveDocumentInWorkspaceState,
  replaceSavedTabInWorkspaceState,
  syncWorkspaceViewModeFromState
} from './stateWorkflowSupport'
import { syncWorkspaceViewMode } from './stateMutationSupport'
import {
  applyRestoredEditorStateRefs,
  applyStatusText,
  applyWorkspaceStateRefs,
  replaceTabCollectionInState,
  type EditorStateRefs,
  type StatusStateRef,
  type WorkspaceStateRefs
} from './stateMutationSupport'

export type {
  EditorStateRefs,
  StatusStateRef,
  WorkspaceStateRefs
} from './stateMutationSupport'

export const applyRestoredEditorState = (
  state: EditorStateRefs,
  restoredState: RestoredEditorState
) => {
  applyRestoredEditorStateRefs(state, restoredState)
}

export const addRecentDocumentToState = (
  recentDocuments: Ref<RecentDocument[]>,
  document: EditorDocument
) => {
  recentDocuments.value = addRecentDocumentEntry(recentDocuments.value, document)
}

export const applyWorkspaceState = (
  state: WorkspaceStateRefs,
  nextState: Pick<PreparedDocumentResult, 'tabs' | 'activeTabId' | 'viewMode'>
) => {
  applyWorkspaceStateRefs(state, nextState)
}

export const syncWorkspaceViewModeInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>
) => {
  syncWorkspaceViewModeFromState(tabs, activeTabId, viewMode, syncWorkspaceViewMode)
}

export const setStatusInState = (status: Ref<string>, text: string) => {
  applyStatusText(status, text)
}

export const replaceTabInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  id: string,
  nextTab: EditorTab
) => {
  replaceTabCollectionInState(tabs, activeTabId, id, nextTab)
}

export const setFocusedTabInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>,
  id: string
) => {
  focusTabInState({ tabs, activeTabId, viewMode, status }, id)
}

export const replaceActiveDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  document: EditorTab
) => {
  replaceActiveDocumentInWorkspaceState({ tabs, activeDocument, activeTabId, viewMode }, document)
}

export const openPreparedDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>,
  document: EditorTab,
  statusText: string
) => {
  openPreparedDocumentInWorkspaceState(
    { tabs, activeDocument, activeTabId, viewMode, status },
    document,
    statusText
  )
}

export const replaceSavedTabInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  currentId: string,
  nextTab: EditorTab
) => {
  replaceSavedTabInWorkspaceState({ tabs, activeTabId, viewMode }, currentId, nextTab)
}

export const closePreparedTabInState = (
  state: WorkspaceStateRefs & StatusStateRef,
  nextState: ClosedTabResult
) => {
  closePreparedTabInWorkspaceState(state, nextState)
}

export const createTabInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  untitledSequence: Ref<number>,
  status: Ref<string>
) => {
  createTabInWorkspaceState({
    tabs,
    activeDocument,
    activeTabId,
    viewMode,
    untitledSequence,
    status
  })
}

export const openSampleDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>
) => {
  openSampleDocumentInWorkspaceState({
    tabs,
    activeDocument,
    activeTabId,
    viewMode,
    status
  })
}
