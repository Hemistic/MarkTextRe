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
    modelValue: view.activeDocument.value?.markdown ?? '',
    pathname: view.activeDocument.value?.pathname ?? null,
    workspaceRootPath: view.projectTree.value?.pathname ?? null
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
    activePathname: view.activeDocument.value?.pathname ?? null,
    activeTabId: view.activeTabId.value,
    mode: view.sideBarMode.value,
    openPathnames: view.tabs.value
      .map(tab => tab.pathname)
      .filter((pathname): pathname is string => Boolean(pathname)),
    projectTree: view.projectTree.value,
    recentDocuments: view.recentDocuments.value,
    searchActiveIndex: search.searchActiveIndex.value,
    searchError: search.searchError.value,
    searchOptions: search.searchOptions.value,
    searchQuery: search.searchQuery.value,
    searchTotal: search.searchTotal.value,
    replaceQuery: search.replaceQuery.value,
    tabs: view.tabs.value,
    tocItems: view.activeDocument.value?.toc ?? []
  }))

  const handlers = {
    closeTab: actions.closeTab,
    newFile: actions.createDocument,
    openFile: actions.openDocument,
    openFolder: actions.openFolder,
    openPath: actions.openDocumentAtPath,
    openRecent: actions.openRecentDocument,
    openSettings: actions.openSettings,
    replaceAll: search.replaceAll,
    replaceCurrent: search.replaceCurrent,
    searchNext: () => search.stepSearch('next'),
    searchPrev: () => search.stepSearch('prev'),
    selectHeading: search.handleHeadingSelect,
    selectTab: actions.selectTab,
    toggleSearchOption: search.toggleSearchOption,
    updateMode: (value: SideBarMode) => {
      view.sideBarMode.value = value
    },
    updateReplaceQuery: search.updateReplace,
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
  showTabBar,
  view
}: {
  actions: HomeViewActions
  showTabBar: Ref<boolean>
  view: EditorWorkspaceViewState
}) => {
  const props = computed(() => ({
    bootstrap: view.bootstrap.value,
    dirty: view.titleDirty.value,
    filename: view.titleFilename.value,
    hasDocument: Boolean(view.activeDocument.value),
    pathname: view.titlePathname.value,
    showPathSegments: view.sideBarMode.value === '',
    showTabBar: showTabBar.value,
    wordCount: view.titleWordCount.value
  }))

  const handlers = {
    closeWindow: actions.closeWindow,
    maximizeWindow: actions.maximizeWindow,
    minimizeWindow: actions.minimizeWindow,
    newFile: actions.createDocument,
    openFile: actions.openPath,
    openFolder: actions.openFolder,
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
  showTabBar,
  view
}: {
  showTabBar: Ref<boolean>
  view: EditorWorkspaceViewState
}) => {
  return computed(() => ({
    hasActiveDocument: Boolean(view.activeDocument.value),
    hasTabs: showTabBar.value && view.tabs.value.length > 0,
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
