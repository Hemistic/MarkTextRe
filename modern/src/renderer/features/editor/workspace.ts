import type { EditorDocument, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'

export interface PreparedDocumentResult {
  tabs: EditorTab[]
  activeTabId: string | null
  viewMode: EditorViewMode
  status: string
}

export interface ClosedTabResult {
  tabs: EditorTab[]
  activeTabId: string | null
  viewMode: EditorViewMode
  closedTab: EditorTab
}

export const resolveActiveDocument = (tabs: EditorTab[], activeTabId: string | null) => {
  if (!activeTabId) {
    return null
  }

  return tabs.find(tab => tab.id === activeTabId) ?? null
}

export const resolveViewMode = (activeDocument: EditorTab | null): EditorViewMode => {
  return activeDocument ? 'editor' : 'home'
}

export const replaceTabInCollection = (tabs: EditorTab[], id: string, nextTab: EditorTab) => {
  return tabs.map(tab => tab.id === id ? nextTab : tab)
}

export const addRecentDocumentEntry = (recentDocuments: RecentDocument[], document: EditorDocument) => {
  if (!document.pathname) {
    return recentDocuments
  }

  return [
    { pathname: document.pathname, filename: document.filename },
    ...recentDocuments.filter(item => item.pathname !== document.pathname)
  ].slice(0, 8)
}

export const shouldReplacePlaceholderTab = (tabs: EditorTab[], activeDocument: EditorTab | null) => {
  return Boolean(
    activeDocument &&
    tabs.length === 1 &&
    !activeDocument.pathname &&
    !activeDocument.dirty
  )
}

export const replaceActiveDocument = (
  tabs: EditorTab[],
  activeDocument: EditorTab | null,
  document: EditorTab
) => {
  if (!activeDocument) {
    return {
      tabs: [document],
      activeTabId: document.id,
      viewMode: 'editor' as const
    }
  }

  return {
    tabs: replaceTabInCollection(tabs, activeDocument.id, document),
    activeTabId: document.id,
    viewMode: 'editor' as const
  }
}

export const openPreparedDocumentInWorkspace = (
  tabs: EditorTab[],
  activeDocument: EditorTab | null,
  document: EditorTab,
  statusText: string
): PreparedDocumentResult => {
  const existing = document.pathname
    ? tabs.find(tab => tab.pathname === document.pathname)
    : tabs.find(tab => tab.id === document.id)

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
