import { hasMarkTextBridge } from '../../services/api'
import {
  persistSessionState,
  syncDirtyState
} from '../../services/appState'
import { registerWindowCloseCoordinator } from '../../services/appCommands'
import type { WindowCloseCoordinator } from './effectSupport'

export interface EditorEffectRuntimeServices {
  bridgeAvailable: () => boolean
  persistSessionState: typeof persistSessionState
  registerWindowCloseCoordinator: (coordinator: WindowCloseCoordinator) => void
  syncDirtyState: typeof syncDirtyState
}

export const createEditorEffectRuntimeServices = (): EditorEffectRuntimeServices => ({
  bridgeAvailable: hasMarkTextBridge,
  persistSessionState,
  registerWindowCloseCoordinator,
  syncDirtyState
})
