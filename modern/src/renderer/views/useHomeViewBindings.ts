import { computed, type Ref } from 'vue'
import type { AppBootstrap, RecentDocument } from '@shared/contracts'
import type { EditorTab } from '../features/editor/types'
import type { EditorChangePayload } from '../features/editor/types'
import type { HomeViewActions } from './homeViewActions'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'

interface HomeSearchState {
  handleEditorChange: (payload: EditorChangePayload) => void
  handleHeadingSelect: (slug: string) => void
  searchActiveIndex: Ref<number>
  searchQuery: Ref<string>
  searchTotal: Ref<number>
  stepSearch: (direction: 'prev' | 'next') => void
  updateSearch: (value: string) => void
}

interface UseHomeViewBindingsInput {
  actions: HomeViewActions
  activeDocument: Ref<EditorTab | null>
  activeTabId: Ref<string | null>
  bootstrap: Ref<AppBootstrap | null>
  muyaEditor: Ref<MuyaEditorExpose | null>
  recentDocuments: Ref<RecentDocument[]>
  search: HomeSearchState
  showHome: Ref<boolean>
  sideBar: Ref<SidebarExpose | null>
  sideBarMode: Ref<'files' | 'search' | 'toc' | ''>
  tabs: Ref<EditorTab[]>
  titleDirty: Ref<boolean>
  titleFilename: Ref<string>
  titlePathname: Ref<string | null>
  titleWordCount: Ref<{
    all: number
    character: number
    paragraph: number
    word: number
  }>
}

export const useHomeViewBindings = ({
  actions,
  activeDocument,
  activeTabId,
  bootstrap,
  muyaEditor,
  recentDocuments,
  search,
  showHome,
  sideBar,
  sideBarMode,
  tabs,
  titleDirty,
  titleFilename,
  titlePathname,
  titleWordCount
}: UseHomeViewBindingsInput) => {
  const sidebarProps = computed(() => ({
    activeTabId: activeTabId.value,
    mode: sideBarMode.value,
    recentDocuments: recentDocuments.value,
    searchActiveIndex: search.searchActiveIndex.value,
    searchQuery: search.searchQuery.value,
    searchTotal: search.searchTotal.value,
    tabs: tabs.value,
    tocItems: activeDocument.value?.toc ?? []
  }))

  const titleBarProps = computed(() => ({
    bootstrap: bootstrap.value,
    dirty: titleDirty.value,
    filename: titleFilename.value,
    hasDocument: Boolean(activeDocument.value),
    pathname: titlePathname.value,
    showTabBar: true,
    wordCount: titleWordCount.value
  }))

  const tabsProps = computed(() => ({
    activeTabId: activeTabId.value ?? '',
    tabs: tabs.value
  }))

  const recentProps = computed(() => ({
    recentDocuments: recentDocuments.value
  }))

  const editorProps = computed(() => ({
    cursor: activeDocument.value?.cursor,
    documentId: activeDocument.value?.id ?? '',
    history: activeDocument.value?.history,
    modelValue: activeDocument.value?.markdown ?? ''
  }))

  return {
    editorHandlers: {
      editorChange: search.handleEditorChange
    },
    editorProps,
    flags: computed(() => ({
      hasActiveDocument: Boolean(activeDocument.value),
      hasTabs: tabs.value.length > 0,
      showHome: showHome.value
    })),
    refs: {
      muyaEditor,
      sideBar
    },
    recentHandlers: {
      create: actions.createDocument,
      openFile: actions.openDocument,
      openRecent: actions.openRecentDocument,
      openSample: actions.openSampleDocument
    },
    recentProps,
    sidebarHandlers: {
      newFile: actions.createDocument,
      openFile: actions.openDocument,
      openRecent: actions.openRecentDocument,
      searchNext: () => search.stepSearch('next'),
      searchPrev: () => search.stepSearch('prev'),
      selectHeading: search.handleHeadingSelect,
      selectTab: actions.selectTab,
      updateMode: (value: 'files' | 'search' | 'toc' | '') => {
        sideBarMode.value = value
      },
      updateSearchQuery: search.updateSearch
    },
    sidebarProps,
    tabsHandlers: {
      close: actions.closeTab,
      create: actions.createDocument,
      select: actions.selectTab
    },
    tabsProps,
    titleBarHandlers: {
      closeWindow: actions.closeWindow,
      maximizeWindow: actions.maximizeWindow,
      minimizeWindow: actions.minimizeWindow,
      newFile: actions.createDocument,
      openFile: actions.openDocument,
      saveFile: actions.saveDocument,
      saveFileAs: actions.saveDocumentAs,
      toggleDevTools: actions.toggleDevToolsWindow
    },
    titleBarProps
  }
}
