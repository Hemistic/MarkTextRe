import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { createEditorActions } from './actions'
import { setupEditorEffects } from './effects'
import { createEditorRuntimeState } from './runtimeState'

export const createEditorStoreRuntime = () => {
  const settings = useSettingsStore()
  const state = createEditorRuntimeState()
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    recentDocuments,
    projectTree,
    status,
    bootstrapLoaded,
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
    headings,
    wordCount,
    lineCount
  } = state
  const actions = createEditorActions(state)

  setupEditorEffects({
    autoSaveSettings: computed(() => ({
      autoSave: settings.state?.autoSave ?? false,
      autoSaveDelay: settings.state?.autoSaveDelay ?? 5000
    })),
    bootstrapLoaded,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    hasDirtyDocuments,
    saveDocument: id => actions.saveDocument(id, false),
    saveAllDirtyDocuments: actions.saveAllDirtyDocuments
  })

  return {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    activeDocument,
    hasOpenDocument,
    hasDirtyDocuments,
    recentDocuments,
    projectTree,
    status,
    headings,
    wordCount,
    lineCount,
    ...actions
  }
}
