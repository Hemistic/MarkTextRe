import type { Ref } from 'vue'
import type { AppBootstrap, EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import type { RestoredEditorState } from './session'
import {
  addRecentDocumentEntry,
  openPreparedDocumentInWorkspace,
  replaceActiveDocument as replaceActiveDocumentInWorkspace,
  replaceTabInCollection,
  resolveActiveDocument,
  resolveViewMode,
  shouldReplacePlaceholderTab
} from './workspace'
import { createDefaultSampleDocument, createUntitledDocument } from './document'

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

export const applyRestoredEditorState = (
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

export const addRecentDocumentToState = (
  recentDocuments: Ref<RecentDocument[]>,
  document: EditorDocument
) => {
  recentDocuments.value = addRecentDocumentEntry(recentDocuments.value, document)
}

export const replaceTabInState = (
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

export const setFocusedTabInState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>,
  id: string
) => {
  const nextTab = tabs.value.find(tab => tab.id === id)
  if (!nextTab) {
    return
  }

  activeTabId.value = id
  viewMode.value = resolveViewMode(resolveActiveDocument(tabs.value, activeTabId.value))
  status.value = `Focused ${nextTab.filename}`
}

export const replaceActiveDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  document: EditorTab
) => {
  const nextState = replaceActiveDocumentInWorkspace(tabs.value, activeDocument.value, document)
  tabs.value = nextState.tabs
  activeTabId.value = nextState.activeTabId
  viewMode.value = nextState.viewMode
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
  tabs.value = nextState.tabs
  activeTabId.value = nextState.activeTabId
  viewMode.value = nextState.viewMode
  status.value = nextState.status
}

export const createTabInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  untitledSequence: Ref<number>,
  status: Ref<string>
) => {
  const sequence = untitledSequence.value
  const document = createUntitledDocument(sequence)
  untitledSequence.value += 1

  if (shouldReplacePlaceholderTab(tabs.value, activeDocument.value)) {
    replaceActiveDocumentInState(tabs, activeDocument, activeTabId, viewMode, document)
  } else {
    tabs.value = [...tabs.value, document]
    activeTabId.value = document.id
    viewMode.value = resolveViewMode(resolveActiveDocument(tabs.value, activeTabId.value))
  }

  status.value = `Created ${document.filename}`
}

export const openSampleDocumentInState = (
  tabs: Ref<EditorTab[]>,
  activeDocument: Ref<EditorTab | null>,
  activeTabId: Ref<string | null>,
  viewMode: Ref<EditorViewMode>,
  status: Ref<string>
) => {
  const sample = createDefaultSampleDocument()
  openPreparedDocumentInState(
    tabs,
    activeDocument,
    activeTabId,
    viewMode,
    status,
    sample,
    'Opened example.md'
  )
}
