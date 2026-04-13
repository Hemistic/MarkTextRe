import { createEditorActions } from './actions'
import { setupEditorEffects } from './effects'
import { createEditorRuntimeState } from './runtimeState'

export const createEditorStoreRuntime = () => {
  const state = createEditorRuntimeState()
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    recentDocuments,
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
    bootstrapLoaded,
    viewMode,
    tabs,
    activeTabId,
    untitledSequence,
    hasDirtyDocuments,
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
    status,
    headings,
    wordCount,
    lineCount,
    ...actions
  }
}
