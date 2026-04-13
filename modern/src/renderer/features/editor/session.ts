import type {
  AppBootstrap,
  EditorSessionState,
  EditorViewMode,
  RecentDocument,
  SettingsState
} from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createDefaultSampleDocument,
  createUntitledDocument
} from './document'
import { resolveSessionState, serializeSessionState } from './serialization'

export interface BootstrapPayload {
  bootstrap: AppBootstrap
  recentDocuments: RecentDocument[]
  sessionState: EditorSessionState | null
}

type StartupSettings = Pick<SettingsState, 'defaultDirectoryToOpen' | 'startUpAction'>

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
}: BootstrapPayload, startupSettings?: StartupSettings | null): RestoredEditorState => {
  const restoredState = resolveSessionState(sessionState)
  const startUpAction = startupSettings?.startUpAction ?? 'lastState'

  if (startUpAction === 'blank') {
    const untitledDocument = createUntitledDocument(restoredState.untitledSequence)

    return {
      bootstrap,
      recentDocuments,
      tabs: [untitledDocument],
      activeTabId: untitledDocument.id,
      untitledSequence: restoredState.untitledSequence + 1,
      viewMode: 'editor',
      status: `Opened ${untitledDocument.filename}`
    }
  }

  if (startUpAction === 'folder') {
    return {
      bootstrap,
      recentDocuments,
      tabs: [],
      activeTabId: null,
      untitledSequence: restoredState.untitledSequence,
      viewMode: 'home',
      status: startupSettings?.defaultDirectoryToOpen
        ? 'Folder startup is not available in the modern shell yet.'
        : 'Set a default directory to use folder startup.'
    }
  }

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
