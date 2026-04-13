import type { Ref } from 'vue'
import type { AppBootstrap, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import type { RestoredEditorState } from './session'
import type { PreparedDocumentResult } from './workspace'
import type { WorkspaceStateTransition } from './stateSupport'
import { replaceTabInCollection, resolveActiveDocument, resolveViewMode } from './workspace'

export interface EditorStateRefs {
  bootstrap: Ref<AppBootstrap | null>
  viewMode: Ref<EditorViewMode>
  tabs: Ref<EditorTab[]>
  activeTabId: Ref<string | null>
  untitledSequence: Ref<number>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
  bootstrapLoaded: Ref<boolean>
}

export interface WorkspaceStateRefs {
  tabs: Ref<EditorTab[]>
  activeTabId: Ref<string | null>
  viewMode: Ref<EditorViewMode>
}

export interface StatusStateRef {
  status: Ref<string>
}

export const applyRestoredEditorStateRefs = (
  state: EditorStateRefs,
  restoredState: RestoredEditorState
) => {
  state.bootstrap.value = restoredState.bootstrap
  state.recentDocuments.value = restoredState.recentDocuments
  state.tabs.value = restoredState.tabs
  state.activeTabId.value = restoredState.activeTabId
  state.untitledSequence.value = restoredState.untitledSequence
  state.viewMode.value = restoredState.viewMode
  state.bootstrapLoaded.value = true
  state.status.value = restoredState.status
}

export const applyWorkspaceStateRefs = (
  state: WorkspaceStateRefs,
  nextState: Pick<PreparedDocumentResult, 'tabs' | 'activeTabId' | 'viewMode'>
) => {
  state.tabs.value = nextState.tabs
  state.activeTabId.value = nextState.activeTabId
  state.viewMode.value = nextState.viewMode
}

export const applyStatusText = (status: Ref<string>, text: string) => {
  status.value = text
}

export const applyWorkspaceStatusTransition = (
  state: WorkspaceStateRefs & StatusStateRef,
  nextState: WorkspaceStateTransition
) => {
  applyWorkspaceStateRefs(state, nextState)
  applyStatusText(state.status, nextState.status)
}

export const syncWorkspaceViewMode = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>
) => {
  viewMode.value = resolveViewMode(resolveActiveDocument(tabs.value, activeTabId.value))
}

export const replaceTabCollectionInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  id: string,
  nextTab: EditorTab
) => {
  tabs.value = replaceTabInCollection(tabs.value, id, nextTab)
  if (activeTabId.value === id) {
    activeTabId.value = nextTab.id
  }
}
