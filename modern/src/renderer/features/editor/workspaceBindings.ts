import {
  executeEditorAppCommand,
  mapKeyboardEventToAppCommand
} from './app-commands'
import type { EditorCommandExecutor } from './app-commands'
import type { AppCommandHandler } from '../../services/appCommands'

export const createEditorKeyboardHandler = (editor: EditorCommandExecutor) => {
  return (event: KeyboardEvent) => {
    const command = mapKeyboardEventToAppCommand(event)
    if (!command) {
      return
    }

    event.preventDefault()
    void executeEditorAppCommand(editor, command)
  }
}

interface RegisterEditorCommandBindingsOptions {
  addWindowListener?: ((type: 'keydown', listener: (event: KeyboardEvent) => void) => void) | null
  bridgeAvailable: boolean
  editor: EditorCommandExecutor
  registerAppCommandHandler: (handler: AppCommandHandler) => () => void
  removeWindowListener?: ((type: 'keydown', listener: (event: KeyboardEvent) => void) => void) | null
}

export const registerEditorCommandBindings = ({
  bridgeAvailable,
  editor,
  registerAppCommandHandler,
  addWindowListener = typeof window !== 'undefined'
    ? window.addEventListener.bind(window)
    : null,
  removeWindowListener = typeof window !== 'undefined'
    ? window.removeEventListener.bind(window)
    : null
}: RegisterEditorCommandBindingsOptions) => {
  if (bridgeAvailable) {
    return registerAppCommandHandler(command => {
      void executeEditorAppCommand(editor, command)
    })
  }

  if (!addWindowListener || !removeWindowListener) {
    return () => {}
  }

  const handleKeydown = createEditorKeyboardHandler(editor)
  addWindowListener('keydown', handleKeydown)

  return () => {
    removeWindowListener('keydown', handleKeydown)
  }
}
