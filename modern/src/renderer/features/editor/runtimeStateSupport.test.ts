import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createEditorCommandState,
  createEditorDerivedState,
  createRecentDocumentsRefresher
} from './runtimeStateSupport'

const createTab = (overrides: Partial<EditorTab> = {}): EditorTab => ({
  id: 'tab-1',
  pathname: 'D:/docs/example.md',
  filename: 'example.md',
  markdown: '# Example\n',
  dirty: false,
  kind: 'file',
  savedMarkdown: '# Example\n',
  headings: [{ depth: 1, text: 'Example' }],
  lineCount: 3,
  wordCount: {
    word: 5,
    paragraph: 1,
    character: 10,
    all: 10
  },
  cursor: null,
  history: null,
  toc: [],
  ...overrides
})

describe('runtimeStateSupport', () => {
  it('creates derived state from the current workspace refs', () => {
    const tabs = ref([
      createTab(),
      createTab({
        id: 'tab-2',
        filename: 'dirty.md',
        dirty: true,
        headings: [{ depth: 2, text: 'Dirty' }],
        wordCount: {
          word: 9,
          paragraph: 2,
          character: 20,
          all: 20
        },
        lineCount: 8
      })
    ])
    const activeTabId = ref<string | null>('tab-2')

    const state = createEditorDerivedState(tabs, activeTabId)

    expect(state.activeDocument.value?.id).toBe('tab-2')
    expect(state.hasOpenDocument.value).toBe(true)
    expect(state.hasDirtyDocuments.value).toBe(true)
    expect(state.headings.value).toEqual([{ depth: 2, text: 'Dirty' }])
    expect(state.wordCount.value).toBe(9)
    expect(state.lineCount.value).toBe(8)
  })

  it('builds the editor command state object without copying refs', () => {
    const tabs = ref([createTab()])
    const activeDocument = computed(() => tabs.value[0] ?? null)
    const activeTabId = ref<string | null>('tab-1')
    const viewMode = ref<'home' | 'editor'>('editor')
    const recentDocuments = ref<RecentDocument[]>([])
    const status = ref('ready')

    const state = createEditorCommandState({
      tabs,
      activeDocument,
      activeTabId,
      viewMode,
      recentDocuments,
      status
    })

    expect(state.tabs).toBe(tabs)
    expect(state.activeDocument).toBe(activeDocument)
    expect(state.activeTabId).toBe(activeTabId)
    expect(state.viewMode).toBe(viewMode)
    expect(state.recentDocuments).toBe(recentDocuments)
    expect(state.status).toBe(status)
  })

  it('refreshes recent documents through the injected loader', async () => {
    const recentDocuments = ref<RecentDocument[]>([])
    const loadRecentDocuments = vi.fn(async () => ([
      {
        filename: 'notes.md',
        pathname: 'D:/docs/notes.md'
      }
    ]))

    const refreshRecentDocuments = createRecentDocumentsRefresher(
      recentDocuments,
      loadRecentDocuments
    )

    await refreshRecentDocuments()

    expect(loadRecentDocuments).toHaveBeenCalledOnce()
    expect(recentDocuments.value).toEqual([{
      filename: 'notes.md',
      pathname: 'D:/docs/notes.md'
    }])
  })
})
