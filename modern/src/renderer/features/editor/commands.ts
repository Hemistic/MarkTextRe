import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createEditorCommandsRuntimeServices,
  type EditorCommandsRuntimeServices
} from './commandsRuntimeServices'
import {
  closeDocumentTabWorkflow,
  openDocumentWorkflow,
  reopenRecentDocumentWorkflow,
  saveAllDirtyDocumentsWorkflow,
  saveDocumentWorkflow
} from './commandsWorkflowSupport'

export interface EditorCommandState {
  tabs: Ref<EditorTab[]>
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  viewMode: Ref<EditorViewMode>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
}

type RefreshRecentDocuments = () => Promise<void>

export const openDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  await openDocumentWorkflow(state, refreshRecentDocuments, runtimeServices)
}

export const reopenRecentDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  pathname: string,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  await reopenRecentDocumentWorkflow(state, refreshRecentDocuments, pathname, runtimeServices)
}

export const saveDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  saveAs = false,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  return saveDocumentWorkflow(state, refreshRecentDocuments, id, saveAs, runtimeServices)
}

export const saveAllDirtyDocumentsInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments
) => {
  return saveAllDirtyDocumentsWorkflow(
    state,
    refreshRecentDocuments,
    tabId => saveDocumentInState(state, refreshRecentDocuments, tabId)
  )
}

export const closeDocumentTabInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  id: string,
  runtimeServices: EditorCommandsRuntimeServices = createEditorCommandsRuntimeServices()
) => {
  await closeDocumentTabWorkflow(
    state,
    refreshRecentDocuments,
    id,
    runtimeServices,
    () => saveDocumentInState(state, refreshRecentDocuments, id, false, runtimeServices)
  )
}
