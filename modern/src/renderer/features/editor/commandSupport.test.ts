import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { EditorViewMode, RecentDocument } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  applySavedTabWithTracking,
  openPreparedDocumentWithTracking,
  resolveDirtyCloseResult,
  trackRecentDocumentInState
} from './commandSupport'

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

const createRecentTrackingState = (
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
    activeDocument,
    activeTabId,
    recentDocuments,
    status,
    tabs,
    viewMode
  }
}

describe('commandSupport', () => {
  it('tracks a recent document before refreshing the main-process list', async () => {
    const recentDocuments = ref<RecentDocument[]>([])
    const refreshRecentDocuments = vi.fn(async () => {})
    const document = createTab({
      id: 'D:/docs/example.md',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      kind: 'file'
    })

    await trackRecentDocumentInState(recentDocuments, refreshRecentDocuments, document)

    expect(recentDocuments.value).toEqual([
      {
        pathname: 'D:/docs/example.md',
        filename: 'example.md'
      }
    ])
    expect(refreshRecentDocuments).toHaveBeenCalledOnce()
  })

  it('opens a prepared document and tracks it as recent in one flow', async () => {
    const document = createTab({
      id: 'D:/docs/example.md',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      kind: 'file'
    })
    const state = createRecentTrackingState([])
    const refreshRecentDocuments = vi.fn(async () => {})

    await openPreparedDocumentWithTracking(
      state,
      refreshRecentDocuments,
      document,
      'Opened example.md'
    )

    expect(state.tabs.value).toEqual([document])
    expect(state.activeTabId.value).toBe(document.id)
    expect(state.viewMode.value).toBe('editor')
    expect(state.status.value).toBe('Opened example.md')
    expect(state.recentDocuments.value[0]).toEqual({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    })
  })

  it('applies a saved tab replacement and tracks it as recent', async () => {
    const current = createTab({
      id: 'untitled:1',
      filename: 'untitled-1.md',
      dirty: true
    })
    const saved = createTab({
      id: 'D:/docs/example.md',
      pathname: 'D:/docs/example.md',
      filename: 'example.md',
      dirty: false,
      kind: 'file'
    })
    const state = createRecentTrackingState([current])
    const refreshRecentDocuments = vi.fn(async () => {})

    await applySavedTabWithTracking(state, refreshRecentDocuments, current.id, saved)

    expect(state.tabs.value[0]).toEqual(saved)
    expect(state.activeTabId.value).toBe(saved.id)
    expect(state.recentDocuments.value[0]).toEqual({
      pathname: 'D:/docs/example.md',
      filename: 'example.md'
    })
    expect(refreshRecentDocuments).toHaveBeenCalledOnce()
  })

  it('returns no close target when a dirty close is cancelled', async () => {
    const current = createTab({
      id: 'untitled:1',
      filename: 'draft.md',
      dirty: true
    })
    const confirmCloseDocument = vi.fn(async () => 'cancel' as const)
    const saveDocument = vi.fn(async () => createTab({ id: 'saved-id' }))

    const result = await resolveDirtyCloseResult(current, confirmCloseDocument, saveDocument)

    expect(result).toEqual({
      closingId: null,
      savedTab: null
    })
    expect(saveDocument).not.toHaveBeenCalled()
  })

  it('uses the saved tab id after confirming a dirty close with save', async () => {
    const current = createTab({
      id: 'untitled:1',
      filename: 'draft.md',
      dirty: true
    })
    const savedTab = createTab({
      id: 'D:/docs/draft.md',
      pathname: 'D:/docs/draft.md',
      filename: 'draft.md',
      kind: 'file',
      dirty: false
    })
    const confirmCloseDocument = vi.fn(async () => 'save' as const)
    const saveDocument = vi.fn(async () => savedTab)

    const result = await resolveDirtyCloseResult(current, confirmCloseDocument, saveDocument)

    expect(result).toEqual({
      closingId: savedTab.id,
      savedTab
    })
    expect(saveDocument).toHaveBeenCalledOnce()
  })
})
