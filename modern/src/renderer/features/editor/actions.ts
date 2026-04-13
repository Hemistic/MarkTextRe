import type { EditorChangePayload } from './types'
import { loadEditorBootstrapIntoState } from './bootstrap'
import {
  closeDocumentTabInState,
  openDocumentInState,
  reopenRecentDocumentInState,
  saveAllDirtyDocumentsInState,
  saveDocumentInState
} from './commands'
import {
  createTabInState,
  openSampleDocumentInState,
  setFocusedTabInState
} from './state'
import type { EditorRuntimeState } from './runtimeState'
import {
  applyActiveDocumentEditorPayload,
  createSaveActiveDocumentAction,
  updateActiveDocumentMarkdown
} from './actionsSupport'

export const createEditorActions = (state: EditorRuntimeState) => {
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    recentDocuments,
    status,
    bootstrapLoaded,
    activeDocument,
    hasDirtyDocuments,
    commandState,
    refreshRecentDocuments
  } = state

  const setActiveTab = (id: string) => {
    setFocusedTabInState(tabs, activeTabId, viewMode, status, id)
  }

  const loadBootstrap = async () => {
    await loadEditorBootstrapIntoState({
      bootstrap,
      viewMode,
      tabs,
      activeTabId,
      untitledSequence,
      recentDocuments,
      status,
      bootstrapLoaded
    }, hasDirtyDocuments)
  }

  const openDocument = async () => {
    await openDocumentInState(commandState, refreshRecentDocuments)
  }

  const reopenRecentDocument = async (pathname: string) => {
    await reopenRecentDocumentInState(commandState, refreshRecentDocuments, pathname)
  }

  const openDocumentAtPath = async (pathname: string) => {
    await reopenRecentDocument(pathname)
  }

  const saveDocument = async (id: string, saveAs = false) => {
    return saveDocumentInState(commandState, refreshRecentDocuments, id, saveAs)
  }

  const saveAllDirtyDocuments = async () => {
    return saveAllDirtyDocumentsInState(commandState, refreshRecentDocuments)
  }

  const closeTab = async (id: string) => {
    await closeDocumentTabInState(commandState, refreshRecentDocuments, id)
  }

  const openSampleDocument = () => {
    openSampleDocumentInState(
      tabs,
      activeDocument,
      activeTabId,
      viewMode,
      status
    )
  }

  const createTab = () => {
    createTabInState(tabs, activeDocument, activeTabId, viewMode, untitledSequence, status)
  }

  const saveActiveDocument = async () => {
    await createSaveActiveDocumentAction(activeTabId, saveDocument)()
  }

  const saveActiveDocumentAs = async () => {
    await createSaveActiveDocumentAction(activeTabId, saveDocument, true)()
  }

  const updateActiveMarkdown = (markdown: string) => {
    updateActiveDocumentMarkdown(activeDocument, markdown)
  }

  const applyActiveEditorState = (payload: EditorChangePayload) => {
    applyActiveDocumentEditorPayload(activeDocument, payload)
  }

  return {
    setActiveTab,
    loadBootstrap,
    openDocument,
    reopenRecentDocument,
    openDocumentAtPath,
    saveDocument,
    saveAllDirtyDocuments,
    closeTab,
    openSampleDocument,
    createTab,
    saveActiveDocument,
    saveActiveDocumentAs,
    updateActiveMarkdown,
    applyActiveEditorState
  }
}
