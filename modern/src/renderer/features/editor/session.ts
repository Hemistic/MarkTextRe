import type { AppBootstrap, EditorSessionState, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createDefaultSampleDocument
} from './document'
import { resolveSessionState, serializeSessionState } from './serialization'

export interface BootstrapPayload {
  bootstrap: AppBootstrap
  recentDocuments: RecentDocument[]
  sessionState: EditorSessionState | null
}

export interface RestoredEditorState {
  bootstrap: AppBootstrap
  recentDocuments: RecentDocument[]
  tabs: EditorTab[]
  activeTabId: string | null
  untitledSequence: number
  viewMode: EditorViewMode
  status: string
}

export const restoreEditorStateFromBootstrap = ({
  bootstrap,
  recentDocuments,
  sessionState
}: BootstrapPayload): RestoredEditorState => {
  const restoredState = resolveSessionState(sessionState)

  if (restoredState.tabs.length === 0) {
    const sampleDocument = createDefaultSampleDocument()

    return {
      bootstrap,
      recentDocuments,
      tabs: [sampleDocument],
      activeTabId: sampleDocument.id,
      untitledSequence: restoredState.untitledSequence,
      viewMode: 'editor',
      status: `Opened ${sampleDocument.filename}`
    }
  }

  return {
    bootstrap,
    recentDocuments,
    tabs: restoredState.tabs,
    activeTabId: restoredState.activeTabId,
    untitledSequence: restoredState.untitledSequence,
    viewMode: restoredState.viewMode,
    status: `Restored ${restoredState.tabs.length} document(s)`
  }
}

export const createPersistedSessionState = (
  viewMode: EditorViewMode,
  activeTabId: string | null,
  untitledSequence: number,
  tabs: EditorTab[]
) => {
  return serializeSessionState(viewMode, activeTabId, untitledSequence, tabs)
}
