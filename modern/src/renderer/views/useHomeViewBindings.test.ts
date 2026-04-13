import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { AppBootstrap } from '@shared/contracts'
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
    const actions = {
      closeTab: vi.fn(),
      closeWindow: vi.fn(async () => {}),
      createDocument: vi.fn(),
      maximizeWindow: vi.fn(async () => {}),
      minimizeWindow: vi.fn(async () => {}),
      openDocument: vi.fn(async () => {}),
      openRecentDocument: vi.fn(async (_pathname: string) => {}),
      openSampleDocument: vi.fn(),
      saveDocument: vi.fn(async () => {}),
      saveDocumentAs: vi.fn(async () => {}),
      selectTab: vi.fn(),
      toggleDevToolsWindow: vi.fn(async () => {})
    }
    const search = {
      handleEditorChange: vi.fn(),
      handleHeadingSelect: vi.fn(),
      searchActiveIndex: ref(1),
      searchQuery: ref('term'),
      searchTotal: ref(3),
      stepSearch: vi.fn(),
      updateSearch: vi.fn()
    }

    const bindings = useHomeViewBindings({
      actions,
      activeDocument: ref({
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
      }),
      activeTabId: ref('tab-1'),
      bootstrap: ref(bootstrap),
      muyaEditor: ref(null),
      recentDocuments: ref([{ filename: 'recent.md', pathname: 'D:/docs/recent.md' }]),
      search,
      showHome: computed(() => false),
      sideBar: ref(null),
      sideBarMode,
      tabs: ref([{
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
      }]),
      titleDirty: ref(false),
      titleFilename: ref('example.md'),
      titlePathname: ref('D:/docs/example.md'),
      titleWordCount: ref({ word: 1, paragraph: 1, character: 8, all: 8 })
    })

    expect(bindings.sidebarProps.value.mode).toBe('files')
    expect(bindings.sidebarProps.value.searchQuery).toBe('term')
    expect(bindings.titleBarProps.value.filename).toBe('example.md')
    expect(bindings.flags.value.hasActiveDocument).toBe(true)
    expect(bindings.editorProps.value.documentId).toBe('tab-1')

    bindings.sidebarHandlers.updateMode('search')
    bindings.sidebarHandlers.searchNext()
    bindings.titleBarHandlers.saveFile()
    bindings.recentHandlers.openSample()

    expect(sideBarMode.value).toBe('search')
    expect(search.stepSearch).toHaveBeenCalledWith('next')
    expect(actions.saveDocument).toHaveBeenCalledOnce()
    expect(actions.openSampleDocument).toHaveBeenCalledOnce()
  })
})
