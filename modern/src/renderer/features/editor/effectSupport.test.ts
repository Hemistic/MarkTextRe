import { afterEach, describe, expect, it, vi } from 'vitest'
import type { EditorTab } from './types'
import {
  createDelayedTaskScheduler,
  createEditorSessionPersistenceTask,
  createWindowCloseCoordinator
} from './effectSupport'

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

describe('effect support', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs only the latest delayed task', async () => {
    vi.useFakeTimers()
    const firstTask = vi.fn(async () => {})
    const secondTask = vi.fn(async () => {})
    const scheduler = createDelayedTaskScheduler()

    scheduler.schedule(firstTask)
    scheduler.schedule(secondTask)
    await vi.advanceTimersByTimeAsync(500)

    expect(firstTask).not.toHaveBeenCalled()
    expect(secondTask).toHaveBeenCalledOnce()
  })

  it('reports delayed task errors and disposes pending work', async () => {
    vi.useFakeTimers()
    const onError = vi.fn()
    const failingTask = vi.fn(async () => {
      throw new Error('persist failed')
    })
    const scheduler = createDelayedTaskScheduler({ onError })

    scheduler.schedule(failingTask)
    await vi.advanceTimersByTimeAsync(500)
    expect(onError).toHaveBeenCalledOnce()

    const pendingTask = vi.fn(async () => {})
    scheduler.schedule(pendingTask)
    scheduler.dispose()
    await vi.advanceTimersByTimeAsync(500)

    expect(pendingTask).not.toHaveBeenCalled()
  })

  it('creates a persistence task only when bootstrap and bridge are available', async () => {
    const persistSessionState = vi.fn(async () => {})

    const unavailableTask = createEditorSessionPersistenceTask({
      bootstrapLoaded: false,
      bridgeAvailable: true,
      persistSessionState,
      viewMode: 'editor',
      activeTabId: 'tab-1',
      untitledSequence: 2,
      tabs: [createTab()]
    })

    expect(unavailableTask).toBeNull()

    const task = createEditorSessionPersistenceTask({
      bootstrapLoaded: true,
      bridgeAvailable: true,
      persistSessionState,
      viewMode: 'editor',
      activeTabId: 'tab-1',
      untitledSequence: 2,
      tabs: [createTab()]
    })

    await task?.()

    expect(persistSessionState).toHaveBeenCalledWith({
      viewMode: 'editor',
      activeTabId: 'tab-1',
      untitledSequence: 2,
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
        toc: [{ content: 'Example', lvl: 1, slug: 'example' }]
      }]
    })
  })

  it('builds a window close coordinator against the current tab getter', async () => {
    let tabs = [createTab({ id: 'clean', dirty: false, filename: 'clean.md' })]
    const saveAllDirtyDocuments = vi.fn(async () => true)
    const coordinator = createWindowCloseCoordinator(() => tabs, saveAllDirtyDocuments)

    tabs = [
      createTab({ id: 'dirty', dirty: true, filename: 'dirty.md' })
    ]

    await expect(coordinator.getDirtyDocuments()).resolves.toEqual([{
      id: 'dirty',
      filename: 'dirty.md'
    }])
    await expect(coordinator.saveAllDirtyDocuments()).resolves.toBe(true)
    expect(saveAllDirtyDocuments).toHaveBeenCalledOnce()
  })
})
