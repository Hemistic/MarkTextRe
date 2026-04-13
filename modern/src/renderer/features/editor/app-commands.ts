import type { AppCommandMessage } from '@shared/contracts'

export interface EditorCommandExecutor {
  createTab: () => void
  openDocument: () => Promise<void>
  openDocumentAtPath: (pathname: string) => Promise<void>
  saveActiveDocument: () => Promise<void>
  saveActiveDocumentAs: () => Promise<void>
}

export const executeEditorAppCommand = async (
  editor: EditorCommandExecutor,
  message: AppCommandMessage
) => {
  switch (message.command) {
    case 'new-file':
      editor.createTab()
      return
    case 'open-file':
      await editor.openDocument()
      return
    case 'open-path':
      if (message.pathname) {
        await editor.openDocumentAtPath(message.pathname)
      }
      return
    case 'save-file':
      await editor.saveActiveDocument()
      return
    case 'save-file-as':
      await editor.saveActiveDocumentAs()
      return
  }
}

export const mapKeyboardEventToAppCommand = (event: KeyboardEvent): AppCommandMessage | null => {
  const modifier = event.metaKey || event.ctrlKey
  if (!modifier || event.altKey) {
    return null
  }

  const key = event.key.toLowerCase()

  if (key === 'n') {
    return { command: 'new-file' }
  }

  if (key === 'o') {
    return { command: 'open-file' }
  }

  if (key === 's' && event.shiftKey) {
    return { command: 'save-file-as' }
  }

  if (key === 's') {
    return { command: 'save-file' }
  }

  return null
}
