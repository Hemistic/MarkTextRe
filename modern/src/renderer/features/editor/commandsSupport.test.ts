import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { EditorTab } from './types'

import {
  findTabById,
  handleMissingRecentDocumentInState
} from './commandsSupport'

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

describe('commandsSupport', () => {
  it('finds tabs by id and returns null when absent', () => {
    const tab = createTab({ id: 'tab-2' })

    expect(findTabById([tab], 'tab-2')).toEqual(tab)
    expect(findTabById([tab], 'missing')).toBeNull()
  })

  it('removes broken recent documents and updates status', async () => {
    const status = ref('')
    const refreshRecentDocuments = vi.fn(async () => {})
    const runtimeServices = {
      removeRecentDocument: vi.fn(async () => {})
    }

    await handleMissingRecentDocumentInState(
      status,
      refreshRecentDocuments,
      'D:/docs/missing.md',
      'Recent file could not be opened.',
      runtimeServices
    )

    expect(runtimeServices.removeRecentDocument).toHaveBeenCalledWith('D:/docs/missing.md')
    expect(refreshRecentDocuments).toHaveBeenCalledOnce()
    expect(status.value).toBe('Recent file could not be opened.')
  })
})
