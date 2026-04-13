import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { EditorTab } from './types'
import {
  createTabInWorkspaceState,
  focusTabInState,
  openSampleDocumentInWorkspaceState
} from './stateWorkflowSupport'

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

describe('stateWorkflowSupport', () => {
  it('focuses an existing tab through workspace state refs', () => {
    const tab = createTab({ id: 'tab-2', filename: 'notes.md' })
    const state = {
      tabs: ref<EditorTab[]>([tab]),
      activeTabId: ref<string | null>(null),
      viewMode: ref<'home' | 'editor'>('home'),
      status: ref('')
    }

    focusTabInState(state, tab.id)

    expect(state.activeTabId.value).toBe('tab-2')
    expect(state.viewMode.value).toBe('editor')
    expect(state.status.value).toBe('Focused notes.md')
  })

  it('creates a new untitled tab and increments the sequence', () => {
    const current = createTab()
    const state = {
      tabs: ref<EditorTab[]>([current]),
      activeDocument: ref<EditorTab | null>(current),
      activeTabId: ref<string | null>(current.id),
      viewMode: ref<'home' | 'editor'>('editor'),
      status: ref(''),
      untitledSequence: ref(2)
    }

    createTabInWorkspaceState(state)

    expect(state.untitledSequence.value).toBe(3)
    expect(state.tabs.value).toHaveLength(2)
    expect(state.status.value).toBe('Created untitled-2.md')
  })

  it('opens the sample document through workspace refs', () => {
    const state = {
      tabs: ref<EditorTab[]>([]),
      activeDocument: ref<EditorTab | null>(null),
      activeTabId: ref<string | null>(null),
      viewMode: ref<'home' | 'editor'>('home'),
      status: ref('')
    }

    openSampleDocumentInWorkspaceState(state)

    expect(state.activeTabId.value).toBe('sample:default')
    expect(state.tabs.value[0]?.filename).toBe('example.md')
    expect(state.status.value).toBe('Opened example.md')
  })
})
