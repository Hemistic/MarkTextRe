import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { AppBootstrap, EditorViewMode, RecentDocument } from '@shared/contracts'
import type { DocumentWordCount, EditorTab, HeadingItem } from './types'

export type WorkspaceSidebarMode = 'files' | 'search' | 'toc' | ''

export interface EditorWorkspaceViewState {
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  bootstrap: Ref<AppBootstrap | null>
  headings: ComputedRef<HeadingItem[]>
  recentDocuments: Ref<RecentDocument[]>
  showHome: ComputedRef<boolean>
  sideBarMode: Ref<WorkspaceSidebarMode>
  tabs: Ref<EditorTab[]>
  titleDirty: ComputedRef<boolean>
  titleFilename: ComputedRef<string>
  titlePathname: ComputedRef<string | null>
  titleWordCount: ComputedRef<DocumentWordCount>
  viewMode: Ref<EditorViewMode>
}

export const EMPTY_WORD_COUNT: DocumentWordCount = {
  word: 0,
  paragraph: 0,
  character: 0,
  all: 0
}

export const createEditorWorkspaceViewState = ({
  activeDocument,
  activeTabId,
  bootstrap,
  headings,
  recentDocuments,
  tabs,
  viewMode
}: {
  activeDocument: ComputedRef<EditorTab | null>
  activeTabId: Ref<string | null>
  bootstrap: Ref<AppBootstrap | null>
  headings: ComputedRef<HeadingItem[]>
  recentDocuments: Ref<RecentDocument[]>
  tabs: Ref<EditorTab[]>
  viewMode: Ref<EditorViewMode>
}): EditorWorkspaceViewState => {
  const sideBarMode = ref<WorkspaceSidebarMode>('files')
  const titleFilename = computed(() => activeDocument.value?.filename ?? '')
  const titlePathname = computed(() => activeDocument.value?.pathname ?? null)
  const titleDirty = computed(() => activeDocument.value?.dirty ?? false)
  const titleWordCount = computed(() => activeDocument.value?.wordCount ?? EMPTY_WORD_COUNT)
  const showHome = computed(() => viewMode.value === 'home' || !activeDocument.value)

  return {
    activeDocument,
    activeTabId,
    bootstrap,
    headings,
    recentDocuments,
    showHome,
    sideBarMode,
    tabs,
    titleDirty,
    titleFilename,
    titlePathname,
    titleWordCount,
    viewMode
  }
}
