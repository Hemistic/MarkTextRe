import type { ComputedRef } from 'vue'
import { restoreEditorStateFromBootstrap } from './session'
import type { EditorStateRefs } from './state'
import { applyRestoredEditorState } from './state'
import { loadBootstrapState, syncDirtyState } from '../../services/app'

export const loadEditorBootstrapIntoState = async (
  state: EditorStateRefs,
  hasDirtyDocuments: ComputedRef<boolean>
) => {
  const bootstrapState = await loadBootstrapState()
  if (!bootstrapState) {
    state.status.value = 'Browser preview mode: preload bridge unavailable.'
    return false
  }

  const restoredState = restoreEditorStateFromBootstrap(bootstrapState)
  applyRestoredEditorState(state, restoredState)
  await syncDirtyState(hasDirtyDocuments.value)
  return true
}
