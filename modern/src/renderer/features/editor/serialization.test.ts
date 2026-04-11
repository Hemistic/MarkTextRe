import { describe, expect, it } from 'vitest'
import type { EditorTab } from './types'
import {
  resolveSessionState,
  serializeSessionState
} from './serialization'

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

describe('serialization', () => {
  it('falls back to the first tab when the active session tab no longer exists', () => {
    const result = resolveSessionState({
      viewMode: 'editor',
      activeTabId: 'missing',
      untitledSequence: 3,
      tabs: [{
        id: 'tab-1',
        pathname: 'D:/docs/example.md',
        filename: 'example.md',
        markdown: '# Example\n',
        dirty: false,
        kind: 'file',
        savedMarkdown: '# Example\n',
        cursor: null,
        history: null,
        toc: []
      }]
    })

    expect(result.activeTabId).toBe('tab-1')
    expect(result.viewMode).toBe('editor')
    expect(result.untitledSequence).toBe(3)
  })

  it('sanitizes non-cloneable fields before persisting session state', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    const [serializedTab] = serializeSessionState('editor', 'tab-1', 2, [
      createTab({
        cursor: {
          start: 1,
          skip: () => undefined
        },
        history: circular,
        toc: [{
          content: 'Example',
          lvl: 1,
          meta: Symbol('skip')
        } as unknown as EditorTab['toc'][number]]
      })
    ]).tabs

    expect(serializedTab?.cursor).toEqual({
      start: 1,
      skip: null
    })
    expect(serializedTab?.history).toEqual({
      self: null
    })
    expect(serializedTab?.toc).toEqual([{
      content: 'Example',
      lvl: 1,
      meta: null
    }])
  })

  it('restores headings from toc when toc data is present', () => {
    const result = resolveSessionState({
      viewMode: 'editor',
      activeTabId: 'tab-1',
      untitledSequence: 1,
      tabs: [{
        id: 'tab-1',
        pathname: 'D:/docs/example.md',
        filename: 'example.md',
        markdown: '# Ignored\n',
        dirty: false,
        kind: 'file',
        savedMarkdown: '# Ignored\n',
        cursor: null,
        history: null,
        toc: [
          { content: 'Real Title', lvl: 1 },
          { content: 'Child', lvl: 2 }
        ]
      }]
    })

    expect(result.tabs[0]?.headings).toEqual([
      { depth: 1, text: 'Real Title' },
      { depth: 2, text: 'Child' }
    ])
  })
})
