import type { Ref } from 'vue'
import type { EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import type { RestoredEditorState } from './session'
import {
  type ClosedTabResult,
  type PreparedDocumentResult,
  addRecentDocumentEntry,
  openPreparedDocumentInWorkspace,
  replaceActiveDocument as replaceActiveDocumentInWorkspace
} from './workspace'
import {
  resolveCreatedTabTransition,
  resolveFocusedTabTransition,
  resolveSampleDocumentTransition,
  resolveSavedTabTransition
} from './stateSupport'
import {
  applyRestoredEditorStateRefs,
  applyStatusText,
  applyWorkspaceStateRefs,
  applyWorkspaceStatusTransition,
  replaceTabCollectionInState,
  syncWorkspaceViewMode,
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
  syncWorkspaceViewMode(tabs, activeTabId, viewMode)
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
  const nextState = resolveFocusedTabTransition(tabs.value, id)
  if (!nextState) {
    return
  }

  applyWorkspaceStatusTransition({ tabs, activeTabId, viewMode, status }, nextState)
}

export const replaceActiveDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  document: EditorTab
) => {
  const nextState = replaceActiveDocumentInWorkspace(tabs.value, activeDocument.value, document)
  applyWorkspaceState({ tabs, activeTabId, viewMode }, nextState)
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
  const nextState = openPreparedDocumentInWorkspace(
    tabs.value,
    activeDocument.value,
    document,
    statusText
  )
  applyWorkspaceStatusTransition({ tabs, activeTabId, viewMode, status }, nextState)
}

export const replaceSavedTabInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  currentId: string,
  nextTab: EditorTab
) => {
  applyWorkspaceState(
    { tabs, activeTabId, viewMode },
    resolveSavedTabTransition(tabs.value, activeTabId.value, currentId, nextTab)
  )
}

export const closePreparedTabInState = (
  state: WorkspaceStateRefs & StatusStateRef,
  nextState: ClosedTabResult
) => {
  applyWorkspaceStateRefs(state, nextState)
  applyStatusText(state.status, `Closed ${nextState.closedTab.filename}`)
}

export const createTabInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  untitledSequence: Ref<number>,
  status: Ref<string>
) => {
  const nextState = resolveCreatedTabTransition(
    tabs.value,
    activeDocument.value,
    untitledSequence.value
  )
  untitledSequence.value += 1

  applyWorkspaceStatusTransition({ tabs, activeTabId, viewMode, status }, nextState)
}

export const openSampleDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>
) => {
  const nextState = resolveSampleDocumentTransition(
    tabs.value,
    activeDocument.value
  )

  applyWorkspaceStatusTransition({ tabs, activeTabId, viewMode, status }, nextState)
}
