import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { AppBootstrap } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  applyRestoredEditorStateRefs,
  applyWorkspaceStateRefs,
  applyWorkspaceStatusTransition,
  replaceTabCollectionInState,
  syncWorkspaceViewMode
} from './stateMutationSupport'

const createTab = (overrides: Partial<EditorTab> = {}): EditorTab => ({
  id: 'tab-1',
  pathname: 'D:/docs/example.md',
  filename: 'example.md',
  markdown: '# Example\n',
  dirty: false,
  kind: 'file',
  savedMarkdown: '# Example\n',
  headings: [{ depth: 1, text: 'Example' }],
  lineCount: 1,
  wordCount: {
    word: 1,
    paragraph: 1,
    character: 10,
    all: 10
  },
  cursor: null,
  history: null,
  toc: [],
  ...overrides
})

describe('stateMutationSupport', () => {
  it('applies restored editor refs in one place', () => {
    const state = {
      bootstrap: ref<AppBootstrap | null>(null),
      viewMode: ref<'home' | 'editor'>('home'),
      tabs: ref<EditorTab[]>([]),
      activeTabId: ref<string | null>(null),
      untitledSequence: ref(1),
      recentDocuments: ref([]),
      status: ref(''),
      bootstrapLoaded: ref(false)
    }

    applyRestoredEditorStateRefs(state, {
      bootstrap: {
        appName: 'MarkText',
        platform: 'win32',
        versions: {
          chrome: '1',
          electron: '1',
          node: '24.0.0',
          v8: '1'
        }
      },
      recentDocuments: [{ filename: 'notes.md', pathname: 'D:/docs/notes.md' }],
      tabs: [createTab()],
      activeTabId: 'tab-1',
      untitledSequence: 4,
      viewMode: 'editor',
      status: 'Restored notes.md'
    })

    expect(state.bootstrap.value?.platform).toBe('win32')
    expect(state.recentDocuments.value).toHaveLength(1)
    expect(state.tabs.value).toHaveLength(1)
    expect(state.activeTabId.value).toBe('tab-1')
    expect(state.untitledSequence.value).toBe(4)
    expect(state.viewMode.value).toBe('editor')
    expect(state.bootstrapLoaded.value).toBe(true)
    expect(state.status.value).toBe('Restored notes.md')
  })

  it('applies workspace-only state and status transitions', () => {
    const tabs = ref<EditorTab[]>([])
    const activeTabId = ref<string | null>(null)
    const viewMode = ref<'home' | 'editor'>('home')
    const status = ref('')
    const nextTab = createTab()

    applyWorkspaceStateRefs(
      { tabs, activeTabId, viewMode },
      { tabs: [nextTab], activeTabId: 'tab-1', viewMode: 'editor' }
    )

    expect(tabs.value).toEqual([nextTab])
    expect(activeTabId.value).toBe('tab-1')
    expect(viewMode.value).toBe('editor')

    applyWorkspaceStatusTransition(
      { tabs, activeTabId, viewMode, status },
      { tabs: [nextTab], activeTabId: 'tab-1', viewMode: 'editor', status: 'Focused example.md' }
    )

    expect(status.value).toBe('Focused example.md')
  })

  it('replaces tabs and keeps active ids aligned', () => {
    const current = createTab()
    const replacement = createTab({
      id: 'tab-2',
      filename: 'saved.md',
      pathname: 'D:/docs/saved.md'
    })
    const tabs = ref([current])
    const activeTabId = ref<string | null>('tab-1')

    replaceTabCollectionInState(tabs, activeTabId, 'tab-1', replacement)

    expect(tabs.value).toEqual([replacement])
    expect(activeTabId.value).toBe('tab-2')
  })

  it('syncs view mode from the current workspace selection', () => {
    const tabs = ref<EditorTab[]>([createTab()])
    const activeTabId = ref<string | null>('tab-1')
    const viewMode = ref<'home' | 'editor'>('home')

    syncWorkspaceViewMode(tabs, activeTabId, viewMode)
    expect(viewMode.value).toBe('editor')

    activeTabId.value = null
    syncWorkspaceViewMode(tabs, activeTabId, viewMode)
    expect(viewMode.value).toBe('home')
  })
})
