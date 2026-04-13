import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
export {
  resolveActiveDocument,
  resolveViewMode
} from './workspaceSelectionSupport'
export {
  addRecentDocumentEntry,
  replaceActiveDocument,
  replaceTabInCollection,
  shouldReplacePlaceholderTab
} from './workspaceTabSupport'
export {
  closeTabInWorkspace,
  openPreparedDocumentInWorkspace
} from './workspaceTransitionSupport'

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
