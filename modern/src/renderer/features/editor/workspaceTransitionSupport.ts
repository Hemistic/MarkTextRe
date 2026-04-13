import type { EditorTab } from './types'
import type { ClosedTabResult, PreparedDocumentResult } from './workspace'
import {
  resolveActiveDocument,
  resolveViewMode
} from './workspaceSelectionSupport'
import {
  replaceActiveDocument,
  replaceTabInCollection,
  shouldReplacePlaceholderTab
} from './workspaceTabSupport'

export const findExistingPreparedDocumentTab = (tabs: EditorTab[], document: EditorTab) => {
  return document.pathname
    ? tabs.find(tab => tab.pathname === document.pathname) ?? null
    : tabs.find(tab => tab.id === document.id) ?? null
}

export const openPreparedDocumentInWorkspace = (
  tabs: EditorTab[],
  activeDocument: EditorTab | null,
  document: EditorTab,
  statusText: string
): PreparedDocumentResult => {
  const existing = findExistingPreparedDocumentTab(tabs, document)

  if (existing) {
    if (existing.dirty) {
      return {
        tabs,
        activeTabId: existing.id,
        viewMode: 'editor',
        status: `Focused ${existing.filename}`
      }
    }

    return {
      tabs: replaceTabInCollection(tabs, existing.id, {
        ...document,
        cursor: existing.cursor,
        history: existing.history
      }),
      activeTabId: document.id,
      viewMode: 'editor',
      status: `Reloaded ${document.filename}`
    }
  }

  if (shouldReplacePlaceholderTab(tabs, activeDocument)) {
    return {
      ...replaceActiveDocument(tabs, activeDocument, document),
      status: statusText
    }
  }

  return {
    tabs: [...tabs, document],
    activeTabId: document.id,
    viewMode: 'editor',
    status: statusText
  }
}

export const closeTabInWorkspace = (
  tabs: EditorTab[],
  activeTabId: string | null,
  closingId: string
): ClosedTabResult | null => {
  const index = tabs.findIndex(item => item.id === closingId)
  if (index === -1) {
    return null
  }

  const closedTab = tabs[index]
  const nextTabs = tabs.filter(item => item.id !== closingId)

  if (nextTabs.length === 0) {
    return {
      tabs: [],
      activeTabId: null,
      viewMode: 'home',
      closedTab
    }
  }

  const nextActiveTabId = activeTabId === closingId
    ? nextTabs[Math.min(index, nextTabs.length - 1)].id
    : activeTabId

  return {
    tabs: nextTabs,
    activeTabId: nextActiveTabId,
    viewMode: resolveViewMode(resolveActiveDocument(nextTabs, nextActiveTabId)),
    closedTab
  }
}
