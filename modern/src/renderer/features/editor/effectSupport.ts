import type {
  EditorSessionState,
  EditorViewMode,
  WindowCloseCoordinator
} from '@shared/contracts'
import type { EditorTab } from './types'
import { getDirtyDocumentSummaries } from './document'
import { createPersistedSessionState } from './session'

export interface DelayedTaskScheduler {
  dispose: () => void
  schedule: (task: (() => Promise<void>) | null) => void
}

interface DelayedTaskSchedulerOptions {
  clearTimeoutFn?: typeof clearTimeout
  delayMs?: number
  onError?: (error: unknown) => void
  setTimeoutFn?: typeof setTimeout
}

interface SessionPersistenceTaskInput {
  activeTabId: string | null
  bootstrapLoaded: boolean
  bridgeAvailable: boolean
  persistSessionState: (sessionState: EditorSessionState) => Promise<void>
  tabs: EditorTab[]
  untitledSequence: number
  viewMode: EditorViewMode
}

interface AutoSaveControllerOptions {
  clearTimeoutFn?: typeof clearTimeout
  onError?: (error: unknown) => void
  setTimeoutFn?: typeof setTimeout
}

interface AutoSaveSnapshot {
  autoSave: boolean
  autoSaveDelay: number
  tabs: EditorTab[]
}

export const createDelayedTaskScheduler = ({
  clearTimeoutFn = clearTimeout,
  delayMs = 500,
  onError = () => {},
  setTimeoutFn = setTimeout
}: DelayedTaskSchedulerOptions = {}): DelayedTaskScheduler => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const dispose = () => {
    if (timer) {
      clearTimeoutFn(timer)
      timer = null
    }
  }

  const schedule = (task: (() => Promise<void>) | null) => {
    if (!task) {
      return
    }

    dispose()
    timer = setTimeoutFn(() => {
      timer = null
      void task().catch(error => {
        onError(error)
      })
    }, delayMs)
  }

  return {
    dispose,
    schedule
  }
}

export const createAutoSaveController = (
  saveDocument: (id: string) => Promise<unknown>,
  {
    clearTimeoutFn = clearTimeout,
    onError = () => {},
    setTimeoutFn = setTimeout
  }: AutoSaveControllerOptions = {}
) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  const clearTimer = (id: string) => {
    const timer = timers.get(id)
    if (!timer) {
      return
    }

    clearTimeoutFn(timer)
    timers.delete(id)
  }

  const dispose = () => {
    for (const id of timers.keys()) {
      clearTimer(id)
    }
  }

  const sync = ({
    autoSave,
    autoSaveDelay,
    tabs
  }: AutoSaveSnapshot) => {
    const eligibleTabs = autoSave
      ? tabs.filter(tab => tab.dirty && Boolean(tab.pathname))
      : []
    const eligibleIds = new Set(eligibleTabs.map(tab => tab.id))

    for (const id of Array.from(timers.keys())) {
      if (!eligibleIds.has(id)) {
        clearTimer(id)
      }
    }

    if (!autoSave) {
      return
    }

    for (const tab of eligibleTabs) {
      clearTimer(tab.id)
      const timer = setTimeoutFn(() => {
        timers.delete(tab.id)
        void saveDocument(tab.id).catch(onError)
      }, autoSaveDelay)
      timers.set(tab.id, timer)
    }
  }

  return {
    dispose,
    sync
  }
}

export const createEditorSessionPersistenceTask = ({
  activeTabId,
  bootstrapLoaded,
  bridgeAvailable,
  persistSessionState,
  tabs,
  untitledSequence,
  viewMode
}: SessionPersistenceTaskInput) => {
  if (!bootstrapLoaded || !bridgeAvailable) {
    return null
  }

  return async () => {
    await persistSessionState(createPersistedSessionState(
      viewMode,
      activeTabId,
      untitledSequence,
      tabs
    ))
  }
}

export const createWindowCloseCoordinator = (
  getTabs: () => EditorTab[],
  saveAllDirtyDocuments: () => Promise<boolean>
): WindowCloseCoordinator => ({
  getDirtyDocuments: async () => getDirtyDocumentSummaries(getTabs()),
  saveAllDirtyDocuments
})
