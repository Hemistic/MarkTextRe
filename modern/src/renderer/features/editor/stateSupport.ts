import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createDefaultSampleDocument,
  createUntitledDocument
} from './document'
import {
  openPreparedDocumentInWorkspace,
  replaceActiveDocument,
  replaceTabInCollection,
  resolveActiveDocument,
  resolveViewMode,
  shouldReplacePlaceholderTab
} from './workspace'

export interface WorkspaceStateTransition {
  activeTabId: string | null
  status: string
  tabs: EditorTab[]
  viewMode: EditorViewMode
}

export interface CreatedTabTransition extends WorkspaceStateTransition {
  document: EditorTab
}

export const resolveFocusedTabTransition = (tabs: EditorTab[], id: string) => {
  const nextTab = tabs.find(tab => tab.id === id)
  if (!nextTab) {
    return null
  }

  return {
    activeTabId: id,
    status: `Focused ${nextTab.filename}`,
    tabs,
    viewMode: resolveViewMode(resolveActiveDocument(tabs, id))
  } satisfies WorkspaceStateTransition
}

export const resolveSavedTabTransition = (
  tabs: EditorTab[],
  activeTabId: string | null,
  currentId: string,
  nextTab: EditorTab
) => {
  const nextTabs = replaceTabInCollection(tabs, currentId, nextTab)
  const nextActiveTabId = activeTabId === currentId ? nextTab.id : activeTabId

  return {
    activeTabId: nextActiveTabId,
    status: '',
    tabs: nextTabs,
    viewMode: resolveViewMode(resolveActiveDocument(nextTabs, nextActiveTabId))
  } satisfies WorkspaceStateTransition
}

export const resolveCreatedTabTransition = (
  tabs: EditorTab[],
  activeDocument: EditorTab | null,
  sequence: number
): CreatedTabTransition => {
  const document = createUntitledDocument(sequence)

  if (shouldReplacePlaceholderTab(tabs, activeDocument)) {
    const nextState = replaceActiveDocument(tabs, activeDocument, document)
    return {
      ...nextState,
      document,
      status: `Created ${document.filename}`
    }
  }

  return {
    activeTabId: document.id,
    document,
    status: `Created ${document.filename}`,
    tabs: [...tabs, document],
    viewMode: 'editor'
  }
}

export const resolveSampleDocumentTransition = (
  tabs: EditorTab[],
  activeDocument: EditorTab | null
) => {
  const sample = createDefaultSampleDocument()
  return openPreparedDocumentInWorkspace(
    tabs,
    activeDocument,
    sample,
    'Opened example.md'
  )
}
