import { hasMarkTextBridge } from '../../services/api'
import { registerAppCommandHandler, type AppCommandHandler } from '../../services/appCommands'
import type { EditorCommandExecutor } from './app-commands'
import { registerEditorCommandBindings } from './workspaceBindings'

interface EditorWorkspaceRuntimeStore extends EditorCommandExecutor {
  loadBootstrap: () => Promise<void>
}

interface StartEditorWorkspaceRuntimeOptions {
  bridgeAvailable?: boolean
  editor: EditorWorkspaceRuntimeStore
  registerEditorBindings?: (options: {
    bridgeAvailable: boolean
    editor: EditorCommandExecutor
    registerAppCommandHandler: (handler: AppCommandHandler) => () => void
  }) => () => void
  registerHandler?: (handler: AppCommandHandler) => () => void
}

export const startEditorWorkspaceRuntime = ({
  bridgeAvailable = hasMarkTextBridge(),
  editor,
  registerEditorBindings = registerEditorCommandBindings,
  registerHandler = registerAppCommandHandler
}: StartEditorWorkspaceRuntimeOptions) => {
  void editor.loadBootstrap()

  return registerEditorBindings({
    editor,
    bridgeAvailable,
    registerAppCommandHandler: registerHandler
  })
}
