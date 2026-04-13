import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { EditorTab } from './types'
import {
  applyActiveDocumentEditorPayload,
  createSaveActiveDocumentAction,
  runForActiveDocument,
  updateActiveDocumentMarkdown
} from './actionsSupport'

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

describe('actionsSupport', () => {
  it('runs active-document mutations only when a tab exists', () => {
    const current = ref<EditorTab | null>(createTab())
    const activeDocument = computed(() => current.value)
    const update = vi.fn(tab => {
      tab.filename = 'updated.md'
      return tab.filename
    })

    expect(runForActiveDocument(activeDocument, update)).toBe('updated.md')
    expect(update).toHaveBeenCalledOnce()
    expect(current.value?.filename).toBe('updated.md')

    current.value = null
    expect(runForActiveDocument(activeDocument, update)).toBeNull()
    expect(update).toHaveBeenCalledOnce()
  })

  it('creates save-active-document actions that guard missing tabs', async () => {
    const activeTabId = ref<string | null>('tab-2')
    const saveDocument = vi.fn(async () => ({ id: 'saved' }))
    const saveActiveDocument = createSaveActiveDocumentAction(activeTabId, saveDocument)
    const saveActiveDocumentAs = createSaveActiveDocumentAction(activeTabId, saveDocument, true)

    await expect(saveActiveDocument()).resolves.toEqual({ id: 'saved' })
    await expect(saveActiveDocumentAs()).resolves.toEqual({ id: 'saved' })
    expect(saveDocument).toHaveBeenNthCalledWith(1, 'tab-2', false)
    expect(saveDocument).toHaveBeenNthCalledWith(2, 'tab-2', true)

    activeTabId.value = null
    await expect(saveActiveDocument()).resolves.toBeNull()
    expect(saveDocument).toHaveBeenCalledTimes(2)
  })

  it('updates markdown and editor payload on the current active document', () => {
    const current = ref<EditorTab | null>(createTab())
    const activeDocument = computed(() => current.value)

    updateActiveDocumentMarkdown(activeDocument, '# Updated\n\ncontent')
    expect(current.value?.markdown).toBe('# Updated\n\ncontent')
    expect(current.value?.dirty).toBe(true)

    applyActiveDocumentEditorPayload(activeDocument, {
      markdown: '# Updated\n\ncontent\nmore',
      wordCount: {
        word: 3,
        paragraph: 2,
        character: 20,
        all: 20
      },
      toc: [{ content: 'Updated', lvl: 1 }]
    })

    expect(current.value?.markdown).toContain('more')
    expect(current.value?.wordCount.word).toBe(3)
    expect(current.value?.toc).toEqual([{ content: 'Updated', lvl: 1 }])
  })
})
