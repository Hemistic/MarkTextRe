import { computed, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createDelayedTaskScheduler,
  createEditorSessionPersistenceTask,
  createWindowCloseCoordinator
} from './effectSupport'
import { createSessionSnapshotKey } from './serialization'
import {
  createEditorEffectRuntimeServices,
  type EditorEffectRuntimeServices
} from './effectRuntimeServices'

interface EditorEffectState {
  bootstrapLoaded: Ref<boolean>
  viewMode: Ref<EditorViewMode>
  tabs: Ref<EditorTab[]>
  activeTabId: Ref<string | null>
  untitledSequence: Ref<number>
  hasDirtyDocuments: ComputedRef<boolean>
  saveAllDirtyDocuments: () => Promise<boolean>
}

export const setupEditorEffects = ({
  bootstrapLoaded,
  viewMode,
  tabs,
  activeTabId,
  untitledSequence,
  hasDirtyDocuments,
  saveAllDirtyDocuments
}: EditorEffectState, runtimeServices: EditorEffectRuntimeServices = createEditorEffectRuntimeServices()) => {
  const sessionSnapshot = computed(() => createSessionSnapshotKey(
    viewMode.value,
    activeTabId.value,
    untitledSequence.value,
    tabs.value
  ))
  const sessionPersistenceScheduler = createDelayedTaskScheduler({
    onError: error => {
      console.error('[modern] failed to persist session state', error)
    }
  })

  const schedulePersistSessionState = () => {
    sessionPersistenceScheduler.schedule(createEditorSessionPersistenceTask({
      bootstrapLoaded: bootstrapLoaded.value,
      bridgeAvailable: runtimeServices.bridgeAvailable(),
      persistSessionState: runtimeServices.persistSessionState,
      viewMode: viewMode.value,
      activeTabId: activeTabId.value,
      untitledSequence: untitledSequence.value,
      tabs: tabs.value
    }))
  }

  watch(hasDirtyDocuments, hasDirty => {
    void runtimeServices.syncDirtyState(hasDirty)
  }, {
    immediate: true
  })

  watch(sessionSnapshot, () => {
    schedulePersistSessionState()
  })

  if (typeof window !== 'undefined') {
    runtimeServices.registerWindowCloseCoordinator(createWindowCloseCoordinator(
      () => tabs.value,
      saveAllDirtyDocuments
    ))
  }

  return () => {
    sessionPersistenceScheduler.dispose()
  }
}
