import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { AppBootstrap, RecentDocument } from '@shared/contracts'
import { loadEditorBootstrapIntoState } from './bootstrap'
import type { EditorStateRefs } from './state'
import type { BootstrapState } from '../../services/appState'

const bootstrap: AppBootstrap = {
  appName: 'MarkText',
  platform: 'win32',
  versions: {
    chrome: '1',
    electron: '1',
    node: '24.0.0',
    v8: '1'
  }
}

const recentDocuments: RecentDocument[] = [{
  pathname: 'D:/docs/example.md',
  filename: 'example.md'
}]

const createState = (): EditorStateRefs => ({
  bootstrap: ref(null),
  viewMode: ref('home'),
  tabs: ref([]),
  activeTabId: ref(null),
  untitledSequence: ref(1),
  recentDocuments: ref([]),
  status: ref(''),
  bootstrapLoaded: ref(false)
})

describe('bootstrap', () => {
  it('falls back to browser-preview status when the preload bridge is unavailable', async () => {
    const runtimeServices = {
      loadBootstrapState: vi.fn(async (): Promise<BootstrapState | null> => null),
      syncDirtyState: vi.fn(async () => {})
    }
    const state = createState()

    const result = await loadEditorBootstrapIntoState(
      state,
      computed(() => false),
      runtimeServices
    )

    expect(result).toBe(false)
    expect(state.status.value).toBe('Browser preview mode: preload bridge unavailable.')
    expect(runtimeServices.syncDirtyState).not.toHaveBeenCalled()
  })

  it('restores bootstrap state and synchronizes dirty status', async () => {
    const runtimeServices = {
      loadBootstrapState: vi.fn(async (): Promise<BootstrapState> => ({
        bootstrap,
        recentDocuments,
        sessionState: {
          viewMode: 'editor',
          activeTabId: 'D:/docs/example.md',
          untitledSequence: 4,
          tabs: [{
            id: 'D:/docs/example.md',
            pathname: 'D:/docs/example.md',
            filename: 'example.md',
            markdown: '# Example\n',
            dirty: false,
            kind: 'file',
            savedMarkdown: '# Example\n',
            cursor: null,
            history: null,
            toc: [{ content: 'Example', lvl: 1, slug: 'example' }]
          }]
        }
      })),
      syncDirtyState: vi.fn(async () => {})
    }
    const state = createState()

    const result = await loadEditorBootstrapIntoState(
      state,
      computed(() => true),
      runtimeServices
    )

    expect(result).toBe(true)
    expect(state.bootstrap.value).toEqual(bootstrap)
    expect(state.bootstrapLoaded.value).toBe(true)
    expect(state.recentDocuments.value).toEqual(recentDocuments)
    expect(state.activeTabId.value).toBe('D:/docs/example.md')
    expect(state.viewMode.value).toBe('editor')
    expect(state.status.value).toBe('Restored 1 document(s)')
    expect(runtimeServices.syncDirtyState).toHaveBeenCalledWith(true)
  })
})
