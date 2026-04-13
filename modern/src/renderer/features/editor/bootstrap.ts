import type { ComputedRef } from 'vue'
import { restoreEditorStateFromBootstrap } from './session'
import type { EditorStateRefs } from './state'
import { applyRestoredEditorState, setStatusInState } from './state'
import {
  createEditorBootstrapRuntimeServices,
  type EditorBootstrapRuntimeServices
} from './bootstrapRuntimeServices'

export const loadEditorBootstrapIntoState = async (
  state: EditorStateRefs,
  hasDirtyDocuments: ComputedRef<boolean>,
  runtimeServices: EditorBootstrapRuntimeServices = createEditorBootstrapRuntimeServices()
) => {
  const bootstrapState = await runtimeServices.loadBootstrapState()
  if (!bootstrapState) {
    setStatusInState(state.status, 'Browser preview mode: preload bridge unavailable.')
    return false
  }

  const restoredState = restoreEditorStateFromBootstrap(bootstrapState)
  applyRestoredEditorState(state, restoredState)
  await runtimeServices.syncDirtyState(hasDirtyDocuments.value)
  return true
}
