import { computed, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { EditorTab } from './types'
import { setupEditorEffects } from './effects'

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
  toc: [{ content: 'Example', lvl: 1, slug: 'example' }],
  ...overrides
})

describe('setupEditorEffects', () => {
  afterEach(() => {
    vi.useRealTimers()
    delete (globalThis as { window?: unknown }).window
  })

  it('syncs dirty state immediately and persists session snapshots through injected services', async () => {
    vi.useFakeTimers()

    const bootstrapLoaded = ref(true)
    const autoSaveSettings = computed(() => ({
      autoSave: false,
      autoSaveDelay: 5000
    }))
    const viewMode = ref<'home' | 'editor'>('editor')
    const tabs = ref<EditorTab[]>([createTab()])
    const activeTabId = ref<string | null>('tab-1')
    const untitledSequence = ref(1)
    const hasDirtyDocuments = computed(() => tabs.value.some(tab => tab.dirty))
    const runtimeServices = {
      bridgeAvailable: vi.fn(() => true),
      persistSessionState: vi.fn(async () => {}),
      registerWindowCloseCoordinator: vi.fn(),
      syncDirtyState: vi.fn(async () => {})
    }

    ;(globalThis as { window?: unknown }).window = {}

    const dispose = setupEditorEffects({
      autoSaveSettings,
      bootstrapLoaded,
      viewMode,
      tabs,
      activeTabId,
      untitledSequence,
      hasDirtyDocuments,
      saveDocument: vi.fn(async () => null),
      saveAllDirtyDocuments: vi.fn(async () => true)
    }, runtimeServices)

    expect(runtimeServices.syncDirtyState).toHaveBeenCalledWith(false)
    expect(runtimeServices.registerWindowCloseCoordinator).toHaveBeenCalledOnce()

    tabs.value = [createTab(), createTab({ id: 'tab-2', filename: 'two.md' })]
    await nextTick()
    await vi.advanceTimersByTimeAsync(500)

    expect(runtimeServices.bridgeAvailable).toHaveBeenCalled()
    expect(runtimeServices.persistSessionState).toHaveBeenCalledOnce()

    dispose()
  })
})
