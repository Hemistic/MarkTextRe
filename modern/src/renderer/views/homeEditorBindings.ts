import type { AppCommandHandler } from '../services/appCommands'
import {
  executeHomeEditorAppCommand,
  mapKeyboardEventToHomeEditorCommand,
  type HomeEditorCommandExecutor
} from './homeEditorCommands'

export const createHomeEditorShortcutHandler = (
  executor: HomeEditorCommandExecutor
) => {
  return (event: KeyboardEvent) => {
    const command = mapKeyboardEventToHomeEditorCommand(event)
    if (!command) {
      return
    }

    event.preventDefault()
    void executeHomeEditorAppCommand(executor, command)
  }
}

interface RegisterHomeEditorBindingsOptions {
  addWindowListener?: ((type: 'keydown', listener: (event: KeyboardEvent) => void) => void) | null
  bridgeAvailable: boolean
  executor: HomeEditorCommandExecutor
  registerAppCommandHandler: (handler: AppCommandHandler) => () => void
  removeWindowListener?: ((type: 'keydown', listener: (event: KeyboardEvent) => void) => void) | null
}

export const registerHomeEditorBindings = ({
  addWindowListener = typeof window !== 'undefined'
    ? window.addEventListener.bind(window)
    : null,
  bridgeAvailable,
  executor,
  registerAppCommandHandler,
  removeWindowListener = typeof window !== 'undefined'
    ? window.removeEventListener.bind(window)
    : null
}: RegisterHomeEditorBindingsOptions) => {
  const handleShortcut = createHomeEditorShortcutHandler(executor)

  if (addWindowListener) {
    addWindowListener('keydown', handleShortcut)
  }

  let unregisterCommands = () => {}
  if (bridgeAvailable) {
    unregisterCommands = registerAppCommandHandler(message => {
      void executeHomeEditorAppCommand(executor, message)
    })
  }

  return () => {
    unregisterCommands()
    if (removeWindowListener) {
      removeWindowListener('keydown', handleShortcut)
    }
  }
}
