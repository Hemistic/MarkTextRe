import { ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { AppBootstrap, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorCommandState } from './commands'
import type { EditorTab, HeadingItem } from './types'
import { DEFAULT_STATUS } from './document'
import {
  createEditorCommandState,
  createEditorDerivedState,
  createRecentDocumentsRefresher
} from './runtimeStateSupport'
import {
  createEditorRuntimeStateServices,
  type EditorRuntimeStateServices
} from './runtimeStateServices'

export interface EditorRuntimeState {
  bootstrap: Ref<AppBootstrap | null>
  viewMode: Ref<EditorViewMode>
  tabs: Ref<EditorTab[]>
  activeTabId: Ref<string | null>
  untitledSequence: Ref<number>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
  bootstrapLoaded: Ref<boolean>
  activeDocument: ComputedRef<EditorTab | null>
  hasOpenDocument: ComputedRef<boolean>
  hasDirtyDocuments: ComputedRef<boolean>
  headings: ComputedRef<HeadingItem[]>
  wordCount: ComputedRef<number>
  lineCount: ComputedRef<number>
  commandState: EditorCommandState
  refreshRecentDocuments: () => Promise<void>
}

export const createEditorRuntimeState = (
  runtimeServices: EditorRuntimeStateServices = createEditorRuntimeStateServices()
): EditorRuntimeState => {
  const bootstrap = ref<AppBootstrap | null>(null)
  const viewMode = ref<EditorViewMode>('home')
  const tabs = ref<EditorTab[]>([])
  const activeTabId = ref<string | null>(null)
  const untitledSequence = ref(1)
  const recentDocuments = ref<RecentDocument[]>([])
  const status = ref(DEFAULT_STATUS)
  const bootstrapLoaded = ref(false)

  const {
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
    headings,
    wordCount,
    lineCount
  } = createEditorDerivedState(tabs, activeTabId)

  const refreshRecentDocuments = createRecentDocumentsRefresher(
    recentDocuments,
    runtimeServices.fetchRecentDocuments
  )

  return {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    recentDocuments,
    status,
    bootstrapLoaded,
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
    headings,
    wordCount,
    lineCount,
    commandState: createEditorCommandState({
      tabs,
      activeDocument,
      activeTabId,
      viewMode,
      recentDocuments,
      status
    }),
    refreshRecentDocuments
  }
}
