import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  CloseDocumentAction,
  EditorViewMode,
  RecentDocument
} from '@shared/contracts'
import type { EditorTab } from './types'
const {
  openDocumentFromPickerMock,
  reopenDocumentFromPathMock,
  saveTabDocumentMock,
  removeRecentDocumentMock
} = vi.hoisted(() => ({
  openDocumentFromPickerMock: vi.fn(),
  reopenDocumentFromPathMock: vi.fn(),
  saveTabDocumentMock: vi.fn(),
  removeRecentDocumentMock: vi.fn()
}))

vi.mock('./files', async () => {
  const actual = await vi.importActual<typeof import('./files')>('./files')
  return {
    ...actual,
    openDocumentFromPicker: openDocumentFromPickerMock,
    reopenDocumentFromPath: reopenDocumentFromPathMock,
    saveTabDocument: saveTabDocumentMock
  }
})

vi.mock('../../services/files', () => ({
  removeRecentDocument: removeRecentDocumentMock
}))

import {
  OPEN_UNAVAILABLE_STATUS,
  RECENT_FILE_OPEN_FAILED_STATUS
} from './files'
import {
  closeDocumentTabInState,
  openDocumentInState,
  reopenRecentDocumentInState,
  saveDocumentInState
} from './commands'

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

const createCommandState = (
  initialTabs: EditorTab[],
  initialRecentDocuments: RecentDocument[] = [],
  initialViewMode: EditorViewMode = initialTabs.length > 0 ? 'editor' : 'home'
) => {
  const tabs = ref(initialTabs)
  const activeTabId = ref(initialTabs[0]?.id ?? null)
  const viewMode = ref<EditorViewMode>(initialViewMode)
  const recentDocuments = ref(initialRecentDocuments)
  const status = ref('')
  const activeDocument = computed(() => tabs.value.find(tab => tab.id === activeTabId.value) ?? null)

  return {
    tabs,
    activeDocument,
    activeTabId,
    viewMode,
    recentDocuments,
    status
  }
}

describe('commands', () => {
  beforeEach(() => {
    openDocumentFromPickerMock.mockReset()
    reopenDocumentFromPathMock.mockReset()
    saveTabDocumentMock.mockReset()
    removeRecentDocumentMock.mockReset()
  })

  const createRuntimeServices = (
    bridgeAvailable: boolean,
    closeAction: CloseDocumentAction = 'cancel'
  ) => ({
    bridgeAvailable: vi.fn(() => bridgeAvailable),
    confirmCloseDocument: vi.fn(async (): Promise<CloseDocumentAction> => closeAction),
    openMarkdown: openDocumentFromPickerMock,
    openMarkdownAtPath: reopenDocumentFromPathMock,
    saveMarkdown: saveTabDocumentMock,
    saveMarkdownAs: saveTabDocumentMock,
    removeRecentDocument: removeRecentDocumentMock
  })

  it('marks open as unavailable when the Electron bridge is missing', async () => {
    const state = createCommandState([])
    const refreshRecentDocuments = vi.fn(async () => {})
    const runtimeServices = createRuntimeServices(false)

    await openDocumentInState(state, refreshRecentDocuments, runtimeServices)

    expect(state.status.value).toBe(OPEN_UNAVAILABLE_STATUS)
    expect(refreshRecentDocuments).not.toHaveBeenCalled()
  })

  it('updates the active tab and recent documents after save as', async () => {
    const current = createTab({
      id: 'untitled:1',
      filename: 'untitled-1.md',
      markdown: '# Draft\n',
      dirty: true,
      savedMarkdown: '# Example\n'
    })
    const saved = createTab({
      id: 'D:/docs/example.md',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      markdown: '# Draft\n',
      savedMarkdown: '# Draft\n',
      dirty: false,
      kind: 'file'
    })
    const state = createCommandState([current])
    const refreshRecentDocuments = vi.fn(async () => {})
    const runtimeServices = createRuntimeServices(true)

    saveTabDocumentMock.mockResolvedValue(saved)

    const result = await saveDocumentInState(
      state,
      refreshRecentDocuments,
      current.id,
      true,
      runtimeServices
    )

    expect(result).toEqual(saved)
    expect(state.tabs.value[0]?.id).toBe(saved.id)
    expect(state.activeTabId.value).toBe(saved.id)
    expect(state.viewMode.value).toBe('editor')
    expect(state.recentDocuments.value[0]).toEqual({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    })
    expect(state.status.value).toBe('Saved as example.md')
    expect(refreshRecentDocuments).toHaveBeenCalledOnce()
  })

  it('removes a broken recent document when reopening fails', async () => {
    reopenDocumentFromPathMock.mockResolvedValue(null)
    const state = createCommandState([])
    const refreshRecentDocuments = vi.fn(async () => {})
    const runtimeServices = createRuntimeServices(true)

    await reopenRecentDocumentInState(
      state,
      refreshRecentDocuments,
      'D:/docs/missing.md',
      runtimeServices
    )

    expect(removeRecentDocumentMock).toHaveBeenCalledWith('D:/docs/missing.md')
    expect(refreshRecentDocuments).toHaveBeenCalledOnce()
    expect(state.status.value).toBe(RECENT_FILE_OPEN_FAILED_STATUS)
  })

  it('saves a dirty tab before closing and then closes the saved tab id', async () => {
    const dirtyTab = createTab({
      id: 'untitled:1',
      filename: 'untitled-1.md',
      markdown: '# Dirty\n',
      dirty: true,
      savedMarkdown: '# Example\n'
    })
    const savedTab = createTab({
      id: 'D:/docs/dirty.md',
      pathname: 'D:/docs/dirty.md',
      filename: 'dirty.md',
      markdown: '# Dirty\n',
      savedMarkdown: '# Dirty\n',
      dirty: false,
      kind: 'file'
    })
    const state = createCommandState([dirtyTab])
    const refreshRecentDocuments = vi.fn(async () => {})
    const runtimeServices = createRuntimeServices(true, 'save')

    saveTabDocumentMock.mockResolvedValue(savedTab)

    await closeDocumentTabInState(
      state,
      refreshRecentDocuments,
      dirtyTab.id,
      runtimeServices
    )

    expect(saveTabDocumentMock).toHaveBeenCalledOnce()
    expect(state.tabs.value).toEqual([])
    expect(state.activeTabId.value).toBeNull()
    expect(state.viewMode.value).toBe('home')
    expect(state.status.value).toBe('Closed dirty.md')
    expect(state.recentDocuments.value[0]).toEqual({
      pathname: 'D:/docs/dirty.md',
      filename: 'dirty.md'
    })
  })
})
