import type { AppCommandMessage } from '@shared/contracts'

export interface HomeEditorCommandExecutor {
  openSearchPanel: () => Promise<void>
  redo: () => void
  undo: () => void
}

export const isTextInputTarget = (target: EventTarget | null) => {
  if (!target || typeof target !== 'object') {
    return false
  }

  const maybeElement = target as {
    isContentEditable?: boolean
    closest?: (selector: string) => unknown
  }

  if (maybeElement.isContentEditable) {
    return false
  }

  return Boolean(maybeElement.closest?.('input, textarea, select'))
}

export const executeHomeEditorAppCommand = async (
  executor: HomeEditorCommandExecutor,
  message: AppCommandMessage
) => {
  switch (message.command) {
    case 'undo':
      executor.undo()
      return
    case 'redo':
      executor.redo()
      return
    case 'search':
      await executor.openSearchPanel()
  }
}

export const mapKeyboardEventToHomeEditorCommand = (
  event: KeyboardEvent
): AppCommandMessage | null => {
  const modifier = event.metaKey || event.ctrlKey
  if (!modifier || event.altKey) {
    return null
  }

  const key = event.key.toLowerCase()

  if (key === 'f') {
    return { command: 'search' }
  }

  if (isTextInputTarget(event.target)) {
    return null
  }

  if (key === 'z' && event.shiftKey) {
    return { command: 'redo' }
  }

  if (key === 'y') {
    return { command: 'redo' }
  }

  if (key === 'z') {
    return { command: 'undo' }
  }

  return null
}
