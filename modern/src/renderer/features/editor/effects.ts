import { watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import { getDirtyDocumentSummaries } from './document'
import { createPersistedSessionState } from './session'
import { hasMarkTextBridge } from '../../services/api'
import {
  persistSessionState,
  registerWindowCloseCoordinator,
  syncDirtyState
} from '../../services/app'

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
}: EditorEffectState) => {
  let persistSessionTimer: ReturnType<typeof setTimeout> | null = null

  const schedulePersistSessionState = () => {
    if (!bootstrapLoaded.value || !hasMarkTextBridge()) {
      return
    }

    if (persistSessionTimer) {
      clearTimeout(persistSessionTimer)
    }

    persistSessionTimer = setTimeout(() => {
      persistSessionTimer = null
      void persistSessionState(createPersistedSessionState(
        viewMode.value,
        activeTabId.value,
        untitledSequence.value,
        tabs.value
      )).catch(error => {
        console.error('[modern] failed to persist session state', error)
      })
    }, 150)
  }

  watch(hasDirtyDocuments, hasDirty => {
    void syncDirtyState(hasDirty)
  }, {
    immediate: true
  })

  watch([
    viewMode,
    tabs,
    activeTabId,
    untitledSequence
  ], () => {
    schedulePersistSessionState()
  }, {
    deep: true
  })

  if (typeof window !== 'undefined') {
    registerWindowCloseCoordinator({
      getDirtyDocuments: async () => getDirtyDocumentSummaries(tabs.value),
      saveAllDirtyDocuments
    })
  }
}
