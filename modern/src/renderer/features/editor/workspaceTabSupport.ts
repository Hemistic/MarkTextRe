import type { EditorDocument, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'

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
