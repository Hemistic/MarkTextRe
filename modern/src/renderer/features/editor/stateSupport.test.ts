import { describe, expect, it } from 'vitest'
import type { EditorTab } from './types'
import {
  resolveCreatedTabTransition,
  resolveFocusedTabTransition,
  resolveSampleDocumentTransition,
  resolveSavedTabTransition
} from './stateSupport'

const createTab = (overrides: Partial<EditorTab> = {}): EditorTab => ({
  id: 'tab-1',
  pathname: null,
  filename: 'untitled-1.md',
  markdown: '# Example\n',
  dirty: false,
  kind: 'untitled',
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

describe('stateSupport', () => {
  it('resolves the focused tab transition when the target tab exists', () => {
    const tab = createTab({ id: 'tab-2', filename: 'notes.md' })

    expect(resolveFocusedTabTransition([tab], tab.id)).toEqual({
      activeTabId: 'tab-2',
      status: 'Focused notes.md',
      tabs: [tab],
      viewMode: 'editor'
    })

    expect(resolveFocusedTabTransition([tab], 'missing')).toBeNull()
  })

  it('resolves a saved tab transition and updates the active id', () => {
    const current = createTab({ id: 'untitled:1' })
    const saved = createTab({
      id: 'D:/docs/example.md',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      dirty: false,
      kind: 'file'
    })

    expect(resolveSavedTabTransition([current], current.id, current.id, saved)).toEqual({
      activeTabId: saved.id,
      status: '',
      tabs: [saved],
      viewMode: 'editor'
    })
  })

  it('creates a new untitled tab transition', () => {
    const current = createTab({ id: 'tab-1', filename: 'notes.md', pathname: 'D:/docs/notes.md', kind: 'file' })

    const result = resolveCreatedTabTransition([current], current, 2)

    expect(result.document.filename).toBe('untitled-2.md')
    expect(result.activeTabId).toBe(result.document.id)
    expect(result.status).toBe('Created untitled-2.md')
    expect(result.tabs).toHaveLength(2)
    expect(result.viewMode).toBe('editor')
  })

  it('reuses the placeholder tab slot when creating a new untitled tab', () => {
    const placeholder = createTab({
      id: 'placeholder',
      filename: 'untitled-1.md',
      pathname: null,
      dirty: false,
      kind: 'untitled'
    })

    const result = resolveCreatedTabTransition([placeholder], placeholder, 3)

    expect(result.tabs).toHaveLength(1)
    expect(result.tabs[0]).toEqual(result.document)
    expect(result.document.filename).toBe('untitled-3.md')
  })

  it('opens the default sample document through workspace transition logic', () => {
    const result = resolveSampleDocumentTransition([], null)

    expect(result.activeTabId).toBe('sample:default')
    expect(result.tabs[0]?.filename).toBe('example.md')
    expect(result.status).toBe('Opened example.md')
    expect(result.viewMode).toBe('editor')
  })
})
