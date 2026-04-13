import { describe, expect, it } from 'vitest'
import type { EditorTab } from './types'
import {
  addRecentDocumentEntry,
  closeTabInWorkspace,
  openPreparedDocumentInWorkspace
} from './workspace'

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

describe('workspace', () => {
  it('replaces a placeholder tab when opening a prepared document', () => {
    const placeholder = createTab()
    const opened = createTab({
      id: 'D:/docs/readme.md',
      pathname: 'D:/docs/readme.md',
      filename: 'readme.md',
      kind: 'file'
    })

    const result = openPreparedDocumentInWorkspace(
      [placeholder],
      placeholder,
      opened,
      'Opened readme.md'
    )

    expect(result.tabs).toEqual([opened])
    expect(result.activeTabId).toBe(opened.id)
    expect(result.viewMode).toBe('editor')
  })

  it('focuses a dirty existing file tab instead of reloading it', () => {
    const dirtyExisting = createTab({
      id: 'D:/docs/readme.md',
      pathname: 'D:/docs/readme.md',
      filename: 'readme.md',
      kind: 'file',
      dirty: true
    })

    const reopened = createTab({
      id: 'D:/docs/readme.md',
      pathname: 'D:/docs/readme.md',
      filename: 'readme.md',
      kind: 'file',
      markdown: '# New Content'
    })

    const result = openPreparedDocumentInWorkspace(
      [dirtyExisting],
      dirtyExisting,
      reopened,
      'Opened readme.md'
    )

    expect(result.tabs[0]).toBe(dirtyExisting)
    expect(result.activeTabId).toBe('D:/docs/readme.md')
    expect(result.status).toBe('Focused readme.md')
  })

  it('closes the active tab and focuses the nearest remaining tab', () => {
    const first = createTab({ id: 'one', filename: 'one.md' })
    const second = createTab({ id: 'two', filename: 'two.md' })
    const third = createTab({ id: 'three', filename: 'three.md' })

    const result = closeTabInWorkspace([first, second, third], 'two', 'two')

    expect(result?.tabs.map(tab => tab.id)).toEqual(['one', 'three'])
    expect(result?.activeTabId).toBe('three')
    expect(result?.closedTab.id).toBe('two')
  })

  it('keeps only the newest eight recent documents', () => {
    const recentDocuments = Array.from({ length: 8 }, (_, index) => ({
      pathname: `D:/docs/${index}.md`,
      filename: `${index}.md`
    }))

    const result = addRecentDocumentEntry(recentDocuments, {
      id: 'D:/docs/new.md',
      pathname: 'D:/docs/new.md',
      filename: 'new.md',
      markdown: '',
      dirty: false
    })

    expect(result).toHaveLength(8)
    expect(result[0]?.pathname).toBe('D:/docs/new.md')
    expect(result.some(item => item.pathname === 'D:/docs/7.md')).toBe(false)
  })
})
