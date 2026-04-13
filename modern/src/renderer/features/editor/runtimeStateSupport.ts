import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorCommandState } from './commands'
import type { EditorTab, HeadingItem } from './types'
import { resolveActiveDocument } from './workspace'

export interface EditorDerivedState {
  activeDocument: ComputedRef<EditorTab | null>
  hasOpenDocument: ComputedRef<boolean>
  hasDirtyDocuments: ComputedRef<boolean>
  headings: ComputedRef<HeadingItem[]>
  wordCount: ComputedRef<number>
  lineCount: ComputedRef<number>
}

interface EditorCommandStateRefs {
  tabs: Ref<EditorTab[]>
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  viewMode: Ref<EditorViewMode>
  recentDocuments: Ref<RecentDocument[]>
  status: Ref<string>
}

type FetchRecentDocuments = () => Promise<RecentDocument[]>

export const createEditorDerivedState = (
  tabs: Ref<EditorTab[]>,
  activeTabId: Ref<string | null>
): EditorDerivedState => {
  const activeDocument = computed(() => resolveActiveDocument(tabs.value, activeTabId.value))
  const hasOpenDocument = computed(() => activeDocument.value !== null)
  const hasDirtyDocuments = computed(() => tabs.value.some(tab => tab.dirty))
  const headings = computed(() => activeDocument.value?.headings ?? [])
  const wordCount = computed(() => activeDocument.value?.wordCount.word ?? 0)
  const lineCount = computed(() => activeDocument.value?.lineCount ?? 1)

  return {
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
    headings,
    wordCount,
    lineCount
  }
}

export const createEditorCommandState = ({
  tabs,
  activeDocument,
  activeTabId,
  viewMode,
  recentDocuments,
  status
}: EditorCommandStateRefs): EditorCommandState => ({
  tabs,
  activeDocument,
  activeTabId,
  viewMode,
  recentDocuments,
  status
})

export const createRecentDocumentsRefresher = (
  recentDocuments: Ref<RecentDocument[]>,
  loadRecentDocuments: FetchRecentDocuments
) => {
  return async () => {
    recentDocuments.value = await loadRecentDocuments()
  }
}
