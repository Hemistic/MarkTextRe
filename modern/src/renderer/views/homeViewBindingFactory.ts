import { computed, type Ref } from 'vue'
import type { EditorWorkspaceViewState } from '../features/editor/workspaceViewSupport'
import type { HomeViewActions } from './homeViewActions'
import type { HomeSearchState } from './useHomeSearch'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'

type SideBarMode = 'files' | 'search' | 'toc' | ''

export const createEditorBindings = ({
  view,
  search
}: {
  view: EditorWorkspaceViewState
  search: HomeSearchState
}) => {
  const props = computed(() => ({
    cursor: view.activeDocument.value?.cursor,
    documentId: view.activeDocument.value?.id ?? '',
    history: view.activeDocument.value?.history,
    modelValue: view.activeDocument.value?.markdown ?? ''
  }))

  const handlers = {
    editorChange: search.handleEditorChange
  }

  return {
    props,
    handlers
  }
}

export const createSidebarBindings = ({
  actions,
  search,
  view
}: {
  actions: HomeViewActions
  search: HomeSearchState
  view: EditorWorkspaceViewState
}) => {
  const props = computed(() => ({
    activeTabId: view.activeTabId.value,
    mode: view.sideBarMode.value,
    recentDocuments: view.recentDocuments.value,
    searchActiveIndex: search.searchActiveIndex.value,
    searchQuery: search.searchQuery.value,
    searchTotal: search.searchTotal.value,
    tabs: view.tabs.value,
    tocItems: view.activeDocument.value?.toc ?? []
  }))

  const handlers = {
    newFile: actions.createDocument,
    openFile: actions.openDocument,
    openRecent: actions.openRecentDocument,
    searchNext: () => search.stepSearch('next'),
    searchPrev: () => search.stepSearch('prev'),
    selectHeading: search.handleHeadingSelect,
    selectTab: actions.selectTab,
    updateMode: (value: SideBarMode) => {
      view.sideBarMode.value = value
    },
    updateSearchQuery: search.updateSearch
  }

  return {
    props,
    handlers
  }
}

export const createTabsBindings = ({
  actions,
  view
}: {
  actions: HomeViewActions
  view: EditorWorkspaceViewState
}) => {
  const props = computed(() => ({
    activeTabId: view.activeTabId.value ?? '',
    tabs: view.tabs.value
  }))

  const handlers = {
    close: actions.closeTab,
    create: actions.createDocument,
    select: actions.selectTab
  }

  return {
    props,
    handlers
  }
}

export const createTitleBarBindings = ({
  actions,
  view
}: {
  actions: HomeViewActions
  view: EditorWorkspaceViewState
}) => {
  const props = computed(() => ({
    bootstrap: view.bootstrap.value,
    dirty: view.titleDirty.value,
    filename: view.titleFilename.value,
    hasDocument: Boolean(view.activeDocument.value),
    pathname: view.titlePathname.value,
    showTabBar: true,
    wordCount: view.titleWordCount.value
  }))

  const handlers = {
    closeWindow: actions.closeWindow,
    maximizeWindow: actions.maximizeWindow,
    minimizeWindow: actions.minimizeWindow,
    newFile: actions.createDocument,
    openFile: actions.openDocument,
    saveFile: actions.saveDocument,
    saveFileAs: actions.saveDocumentAs,
    toggleDevTools: actions.toggleDevToolsWindow
  }

  return {
    props,
    handlers
  }
}

export const createRecentBindings = ({
  actions,
  view
}: {
  actions: HomeViewActions
  view: EditorWorkspaceViewState
}) => {
  const props = computed(() => ({
    recentDocuments: view.recentDocuments.value
  }))

  const handlers = {
    create: actions.createDocument,
    openFile: actions.openDocument,
    openRecent: actions.openRecentDocument,
    openSample: actions.openSampleDocument
  }

  return {
    props,
    handlers
  }
}

export const createHomeFlags = ({
  view
}: {
  view: EditorWorkspaceViewState
}) => {
  return computed(() => ({
    hasActiveDocument: Boolean(view.activeDocument.value),
    hasTabs: view.tabs.value.length > 0,
    showHome: view.showHome.value
  }))
}

export const createHomeRefs = ({
  muyaEditor,
  sideBar
}: {
  muyaEditor: Ref<MuyaEditorExpose | null>
  sideBar: Ref<SidebarExpose | null>
}) => {
  return {
    muyaEditor,
    sideBar
  }
}
