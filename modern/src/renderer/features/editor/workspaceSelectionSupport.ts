import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'

export const resolveActiveDocument = (tabs: EditorTab[], activeTabId: string | null) => {
  if (!activeTabId) {
    return null
  }

  return tabs.find(tab => tab.id === activeTabId) ?? null
}

export const resolveViewMode = (activeDocument: EditorTab | null): EditorViewMode => {
  return activeDocument ? 'editor' : 'home'
}
