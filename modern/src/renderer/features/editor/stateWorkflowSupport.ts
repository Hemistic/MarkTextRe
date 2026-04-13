import type { Ref } from 'vue'
import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import type { ClosedTabResult } from './workspace'
import {
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
  applyStatusText,
  applyWorkspaceStateRefs,
  applyWorkspaceStatusTransition,
  type StatusStateRef,
  type WorkspaceStateRefs
} from './stateMutationSupport'

export interface ActiveWorkspaceStateRefs extends WorkspaceStateRefs {
  activeDocument: Ref<EditorTab | null>
}

export const focusTabInState = (
  state: WorkspaceStateRefs & StatusStateRef,
  id: string
) => {
  const nextState = resolveFocusedTabTransition(state.tabs.value, id)
  if (!nextState) {
    return
  }

  applyWorkspaceStatusTransition(state, nextState)
}

export const replaceActiveDocumentInWorkspaceState = (
  state: ActiveWorkspaceStateRefs,
  document: EditorTab
) => {
  const nextState = replaceActiveDocumentInWorkspace(
    state.tabs.value,
    state.activeDocument.value,
    document
  )
  applyWorkspaceStateRefs(state, nextState)
}

export const openPreparedDocumentInWorkspaceState = (
  state: ActiveWorkspaceStateRefs & StatusStateRef,
  document: EditorTab,
  statusText: string
) => {
  const nextState = openPreparedDocumentInWorkspace(
    state.tabs.value,
    state.activeDocument.value,
    document,
    statusText
  )
  applyWorkspaceStatusTransition(state, nextState)
}

export const replaceSavedTabInWorkspaceState = (
  state: WorkspaceStateRefs,
  currentId: string,
  nextTab: EditorTab
) => {
  applyWorkspaceStateRefs(
    state,
    resolveSavedTabTransition(state.tabs.value, state.activeTabId.value, currentId, nextTab)
  )
}

export const closePreparedTabInWorkspaceState = (
  state: WorkspaceStateRefs & StatusStateRef,
  nextState: ClosedTabResult
) => {
  applyWorkspaceStateRefs(state, nextState)
  applyStatusText(state.status, `Closed ${nextState.closedTab.filename}`)
}

export const createTabInWorkspaceState = (
  state: ActiveWorkspaceStateRefs & StatusStateRef & { untitledSequence: Ref<number> }
) => {
  const nextState = resolveCreatedTabTransition(
    state.tabs.value,
    state.activeDocument.value,
    state.untitledSequence.value
  )
  state.untitledSequence.value += 1

  applyWorkspaceStatusTransition(state, nextState)
}

export const openSampleDocumentInWorkspaceState = (
  state: ActiveWorkspaceStateRefs & StatusStateRef
) => {
  const nextState = resolveSampleDocumentTransition(
    state.tabs.value,
    state.activeDocument.value
  )

  applyWorkspaceStatusTransition(state, nextState)
}

export const syncWorkspaceViewModeFromState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  syncWorkspaceViewMode: (
    tabs: Ref<EditorTab[]>,
    activeTabId: Ref<string | null>,
    viewMode: Ref<EditorViewMode>
  ) => void
) => {
  syncWorkspaceViewMode(tabs, activeTabId, viewMode)
}
