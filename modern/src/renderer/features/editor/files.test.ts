import { reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { EditorTab } from './types'
import {
  createSavedTab,
  getDirtyTabIds,
  openDocumentFromPicker,
  reopenDocumentFromPath,
  saveTabDocument
} from './files'

const createTab = (overrides: Partial<EditorTab> = {}): EditorTab => ({
  id: 'tab-1',
  pathname: null,
  filename: 'untitled-1.md',
  markdown: '# Example\n',
  dirty: true,
  kind: 'untitled',
  savedMarkdown: '# Old\n',
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

describe('files', () => {
  it('creates a saved file tab from the save result', () => {
    const savedTab = createSavedTab(createTab(), {
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    })

    expect(savedTab.id).toBe('D:/docs/example.md')
    expect(savedTab.pathname).toBe('D:/docs/example.md')
    expect(savedTab.filename).toBe('example.md')
    expect(savedTab.kind).toBe('file')
    expect(savedTab.dirty).toBe(false)
    expect(savedTab.savedMarkdown).toBe('# Example\n')
  })

  it('collects only dirty tab ids', () => {
    expect(getDirtyTabIds([
      createTab({ id: 'dirty-1', dirty: true }),
      createTab({ id: 'clean', dirty: false }),
      createTab({ id: 'dirty-2', dirty: true })
    ])).toEqual(['dirty-1', 'dirty-2'])
  })

  it('opens and normalizes documents through injected runtime services', async () => {
    const runtimeServices = {
      openMarkdown: vi.fn(async () => ({
        id: 'D:/docs/opened.md',
        pathname: 'D:/docs/opened.md',
        filename: 'opened.md',
        markdown: '# Opened\n',
        dirty: false
      })),
      openMarkdownAtPath: vi.fn(async (pathname: string) => ({
        id: pathname,
        pathname,
        filename: 'reopened.md',
        markdown: '# Reopened\n',
        dirty: false
      })),
      saveMarkdown: vi.fn(async () => null),
      saveMarkdownAs: vi.fn(async () => null)
    }

    const opened = await openDocumentFromPicker(runtimeServices)
    const reopened = await reopenDocumentFromPath('D:/docs/reopened.md', runtimeServices)

    expect(runtimeServices.openMarkdown).toHaveBeenCalledOnce()
    expect(runtimeServices.openMarkdownAtPath).toHaveBeenCalledWith('D:/docs/reopened.md')
    expect(opened?.id).toBe('D:/docs/opened.md')
    expect(opened?.kind).toBe('file')
    expect(reopened?.filename).toBe('reopened.md')
  })

  it('saves through the correct injected runtime service', async () => {
    const saveMarkdown = vi.fn(async () => ({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    }))
    const saveMarkdownAs = vi.fn(async () => ({
      pathname: 'D:/docs/example-copy.md',
      filename: 'example-copy.md'
    }))
    const runtimeServices = {
      openMarkdown: vi.fn(async () => null),
      openMarkdownAtPath: vi.fn(async () => null),
      saveMarkdown,
      saveMarkdownAs
    }

    const current = createTab({
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      kind: 'file'
    })

    const saved = await saveTabDocument(current, false, runtimeServices)
    const savedAs = await saveTabDocument(current, true, runtimeServices)

    expect(saveMarkdown).toHaveBeenCalledWith({
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Example\n',
      encoding: undefined,
      lineEnding: undefined,
      adjustLineEndingOnSave: undefined,
      trimTrailingNewline: undefined
    })
    expect(saveMarkdownAs).toHaveBeenCalledWith({
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Example\n',
      encoding: undefined,
      lineEnding: undefined,
      adjustLineEndingOnSave: undefined,
      trimTrailingNewline: undefined
    })
    expect(saved?.pathname).toBe('D:/docs/example.md')
    expect(savedAs?.pathname).toBe('D:/docs/example-copy.md')
  })

  it('uses current settings defaults when first saving an untitled tab', async () => {
    const saveMarkdown = vi.fn(async () => ({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    }))
    const runtimeServices = {
      openMarkdown: vi.fn(async () => null),
      openMarkdownAtPath: vi.fn(async () => null),
      saveMarkdown,
      saveMarkdownAs: vi.fn(async () => null)
    }

    await saveTabDocument(createTab(), false, runtimeServices)

    expect(saveMarkdown).toHaveBeenCalledWith({
      pathname: null,
      filename: 'untitled-1.md',
      markdown: '# Example\n'
    })
  })

  it('sanitizes reactive encoding metadata before saving over IPC', async () => {
    const saveMarkdown = vi.fn(async () => ({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    }))
    const runtimeServices = {
      openMarkdown: vi.fn(async () => null),
      openMarkdownAtPath: vi.fn(async () => null),
      saveMarkdown,
      saveMarkdownAs: vi.fn(async () => null)
    }

    await saveTabDocument(createTab({
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      kind: 'file',
      encoding: reactive({
        encoding: 'utf8',
        isBom: false
      })
    }), false, runtimeServices)

    expect(saveMarkdown).toHaveBeenCalledWith({
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Example\n',
      encoding: {
        encoding: 'utf8',
        isBom: false
      },
      lineEnding: undefined,
      adjustLineEndingOnSave: undefined,
      trimTrailingNewline: undefined
    })
  })
})
