import { computed, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import {
  createAutoSaveController,
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
  autoSaveSettings: ComputedRef<{
    autoSave: boolean
    autoSaveDelay: number
  }>
  bootstrapLoaded: Ref<boolean>
  viewMode: Ref<EditorViewMode>
  tabs: Ref<EditorTab[]>
  activeTabId: Ref<string | null>
  untitledSequence: Ref<number>
  hasDirtyDocuments: ComputedRef<boolean>
  saveDocument: (id: string) => Promise<unknown>
  saveAllDirtyDocuments: () => Promise<boolean>
}

export const setupEditorEffects = ({
  autoSaveSettings,
  bootstrapLoaded,
  viewMode,
  tabs,
  activeTabId,
  untitledSequence,
  hasDirtyDocuments,
  saveDocument,
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
  const autoSaveController = createAutoSaveController(saveDocument, {
    onError: error => {
      console.error('[modern] failed to auto-save document', error)
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

  watch([tabs, autoSaveSettings], ([nextTabs, nextSettings]) => {
    autoSaveController.sync({
      autoSave: nextSettings.autoSave,
      autoSaveDelay: nextSettings.autoSaveDelay,
      tabs: nextTabs
    })
  }, {
    deep: true,
    immediate: true
  })

  if (typeof window !== 'undefined') {
    runtimeServices.registerWindowCloseCoordinator(createWindowCloseCoordinator(
      () => tabs.value,
      saveAllDirtyDocuments
    ))
  }

  return () => {
    autoSaveController.dispose()
    sessionPersistenceScheduler.dispose()
  }
}
