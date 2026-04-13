import {
  loadBootstrapState,
  syncDirtyState
} from '../../services/appState'

export interface EditorBootstrapRuntimeServices {
  loadBootstrapState: typeof loadBootstrapState
  syncDirtyState: typeof syncDirtyState
}

export const createEditorBootstrapRuntimeServices = (): EditorBootstrapRuntimeServices => ({
  loadBootstrapState,
  syncDirtyState
})
