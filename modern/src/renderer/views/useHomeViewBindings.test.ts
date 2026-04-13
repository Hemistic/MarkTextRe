import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { AppBootstrap, ProjectTreeNode } from '@shared/contracts'
import type { EditorWorkspaceViewState } from '../features/editor/workspaceViewSupport'
import type { DocumentWordCount, EditorTab } from '../features/editor/types'
import { useHomeViewBindings } from './useHomeViewBindings'

const bootstrap: AppBootstrap = {
  appName: 'MarkText',
  platform: 'win32',
  versions: {
    chrome: '1',
    electron: '1',
    node: '24.0.0',
    v8: '1'
  }
}

describe('useHomeViewBindings', () => {
  it('builds view bindings from renderer state and actions', async () => {
    const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')
    const showTabBar = computed(() => true)
    const actions = {
      closeTab: vi.fn(),
      closeWindow: vi.fn(async () => {}),
      createDocument: vi.fn(),
      maximizeWindow: vi.fn(async () => {}),
      minimizeWindow: vi.fn(async () => {}),
      openPath: vi.fn(async () => {}),
      openDocument: vi.fn(async () => {}),
      openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
      openFolder: vi.fn(async () => {}),
      openFolderAtPath: vi.fn(async (_pathname: string) => true),
      openRecentDocument: vi.fn(async (_pathname: string) => {}),
      openSettings: vi.fn(),
      openSampleDocument: vi.fn(),
      saveDocument: vi.fn(async () => {}),
      saveDocumentAs: vi.fn(async () => {}),
      selectTab: vi.fn(),
      toggleDevToolsWindow: vi.fn(async () => {})
    }
    const search = {
      handleEditorChange: vi.fn(),
      handleHeadingSelect: vi.fn(),
      openSearchPanel: vi.fn(async () => {}),
      replaceAll: vi.fn(),
      replaceCurrent: vi.fn(),
      replaceQuery: ref('updated'),
      refreshActiveDocumentSearch: vi.fn(),
      searchActiveIndex: ref(1),
      searchError: ref(''),
      searchOptions: ref({
        isCaseSensitive: false,
        isWholeWord: false,
        isRegexp: false
      }),
      searchQuery: ref('term'),
      searchTotal: ref(3),
      stepSearch: vi.fn(),
      toggleSearchOption: vi.fn(),
      updateReplace: vi.fn(),
      updateSearch: vi.fn()
    }

    const doc = ref<EditorTab>({
      id: 'tab-1',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Example',
      dirty: false,
      kind: 'file',
      savedMarkdown: '# Example',
      headings: [],
      lineCount: 1,
      wordCount: { word: 1, paragraph: 1, character: 8, all: 8 },
      cursor: { start: 1 },
      history: { undo: [] },
      toc: [{ content: 'Example', lvl: 1, slug: 'example' }]
    })

    const tabs = ref<EditorTab[]>([
      {
        id: 'tab-1',
        pathname: 'D:/docs/example.md',
        filename: 'example.md',
        markdown: '# Example',
        dirty: false,
        kind: 'file',
        savedMarkdown: '# Example',
        headings: [],
        lineCount: 1,
        wordCount: { word: 1, paragraph: 1, character: 8, all: 8 },
        cursor: null,
        history: null,
        toc: []
      }
    ])

    const wordCount: DocumentWordCount = {
      word: 1,
      paragraph: 1,
      character: 8,
      all: 8
    }
    const projectTree = ref<ProjectTreeNode | null>({
      id: 'D:/docs',
      pathname: 'D:/docs',
      name: 'docs',
      isDirectory: true,
      isFile: false,
      isMarkdown: false,
      files: [],
      folders: []
    })

    const viewState: EditorWorkspaceViewState = {
      activeDocument: computed<EditorTab | null>(() => doc.value),
      activeTabId: ref('tab-1'),
      bootstrap: ref(bootstrap),
      headings: computed(() => []),
      projectTree,
      recentDocuments: ref([{ filename: 'recent.md', pathname: 'D:/docs/recent.md' }]),
      showTabBar: ref(true),
      showHome: computed(() => false),
      sideBarMode,
      tabs,
      titleDirty: computed(() => false),
      titleFilename: computed(() => 'example.md'),
      titlePathname: computed(() => 'D:/docs/example.md'),
      titleWordCount: computed(() => wordCount),
      viewMode: ref('home')
    }

    const bindings = useHomeViewBindings({
      actions,
      muyaEditor: ref(null),
      search,
      showTabBar,
      sideBar: ref(null),
      view: viewState
    })

    expect(bindings.sidebarProps.value.mode).toBe('files')
    expect(bindings.sidebarProps.value.projectTree?.pathname).toBe('D:/docs')
    expect(bindings.sidebarProps.value.searchQuery).toBe('term')
    expect(bindings.sidebarProps.value.replaceQuery).toBe('updated')
    expect(bindings.sidebarProps.value.searchError).toBe('')
    expect(bindings.sidebarProps.value.searchOptions.isRegexp).toBe(false)
    expect(bindings.titleBarProps.value.filename).toBe('example.md')
    expect(bindings.titleBarProps.value.showPathSegments).toBe(false)
    expect(bindings.titleBarProps.value.showTabBar).toBe(true)
    expect(bindings.flags.value.hasTabs).toBe(true)
    expect(bindings.flags.value.hasActiveDocument).toBe(true)
    expect(bindings.editorProps.value.documentId).toBe('tab-1')

    bindings.sidebarHandlers.updateMode('search')
    bindings.sidebarHandlers.updateReplaceQuery('replacement')
    bindings.sidebarHandlers.toggleSearchOption('isRegexp')
    bindings.sidebarHandlers.replaceCurrent()
    bindings.sidebarHandlers.replaceAll()
    bindings.sidebarHandlers.searchNext()
    await bindings.sidebarHandlers.openPath('D:/docs/example.md')
    await bindings.sidebarHandlers.openFolder()
    await bindings.titleBarHandlers.openFile()
    await bindings.titleBarHandlers.openFolder()
    bindings.titleBarHandlers.saveFile()
    bindings.recentHandlers.openSample()

    expect(sideBarMode.value).toBe('search')
    expect(search.updateReplace).toHaveBeenCalledWith('replacement')
    expect(search.toggleSearchOption).toHaveBeenCalledWith('isRegexp')
    expect(search.replaceCurrent).toHaveBeenCalledOnce()
    expect(search.replaceAll).toHaveBeenCalledOnce()
    expect(search.stepSearch).toHaveBeenCalledWith('next')
    expect(actions.openDocumentAtPath).toHaveBeenCalledWith('D:/docs/example.md')
    expect(actions.openPath).toHaveBeenCalledOnce()
    expect(actions.openFolder).toHaveBeenCalledTimes(2)
    expect(actions.saveDocument).toHaveBeenCalledOnce()
    expect(actions.openSampleDocument).toHaveBeenCalledOnce()
  })
})
