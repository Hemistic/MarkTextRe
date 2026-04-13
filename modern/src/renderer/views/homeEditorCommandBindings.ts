import { hasMarkTextBridge } from '../services/api'
import { registerAppCommandHandler, type AppCommandHandler } from '../services/appCommands'
import { registerHomeEditorBindings } from './homeEditorBindings'
import type { HomeEditorCommandExecutor } from './homeEditorCommands'

interface StartHomeEditorCommandBindingsOptions {
  bridgeAvailable?: boolean
  executor: HomeEditorCommandExecutor
  registerBindings?: (options: {
    bridgeAvailable: boolean
    executor: HomeEditorCommandExecutor
    registerAppCommandHandler: (handler: AppCommandHandler) => () => void
  }) => () => void
  registerHandler?: (handler: AppCommandHandler) => () => void
}

export const startHomeEditorCommandBindings = ({
  bridgeAvailable = hasMarkTextBridge(),
  executor,
  registerBindings = registerHomeEditorBindings,
  registerHandler = registerAppCommandHandler
}: StartHomeEditorCommandBindingsOptions) => {
  return registerBindings({
    bridgeAvailable,
    executor,
    registerAppCommandHandler: registerHandler
  })
}
