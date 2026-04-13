import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { ensureBridgeCommandAvailable, saveAllDirtyDocumentsWorkflow } from './commandsWorkflowSupport'
import type { EditorTab } from './types'

const createTab = (id: string, dirty: boolean): EditorTab => ({
  id,
  pathname: null,
  filename: `${id}.md`,
  markdown: '# Example\n',
  dirty,
  kind: 'untitled',
  savedMarkdown: '# Example\n',
  headings: [],
  lineCount: 1,
  wordCount: {
    word: 1,
    paragraph: 1,
    character: 10,
    all: 10
  },
  cursor: null,
  history: null,
  toc: []
})

describe('commandsWorkflowSupport', () => {
  it('sets an unavailable status when a bridge command cannot run', () => {
    const status = ref('')

    expect(ensureBridgeCommandAvailable(status, false, 'Unavailable')).toBe(false)
    expect(status.value).toBe('Unavailable')
  })

  it('saves each dirty tab id until a save fails', async () => {
    const state = {
      tabs: ref([
        createTab('a', true),
        createTab('b', false),
        createTab('c', true)
      ])
    } as any
    const saveDocument = vi.fn(async (id: string) => id === 'c' ? null : createTab(id, false))

    await expect(
      saveAllDirtyDocumentsWorkflow(state, async () => {}, saveDocument)
    ).resolves.toBe(false)
    expect(saveDocument).toHaveBeenCalledTimes(2)
    expect(saveDocument).toHaveBeenNthCalledWith(1, 'a')
    expect(saveDocument).toHaveBeenNthCalledWith(2, 'c')
  })
})
