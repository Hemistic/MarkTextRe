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
