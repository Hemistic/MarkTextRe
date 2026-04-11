import { dialog } from 'electron'
import type { BrowserWindow, MessageBoxOptions } from 'electron'
import type { CloseDocumentAction } from '@shared/contracts'

const MARKDOWN_FILE_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'txt'] }
]

export const showSaveMarkdownDialog = async (filename: string) => {
  const result = await dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: filename || 'untitled.md',
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  return result.filePath
}

export const showOpenMarkdownDialog = async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open Markdown File',
    filters: MARKDOWN_FILE_FILTERS,
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
}

export const showDocumentCloseConfirmation = async (
  window: BrowserWindow | null,
  filename: string
): Promise<CloseDocumentAction> => {
  const dialogOptions: MessageBoxOptions = {
    type: 'warning',
    buttons: ['Save', 'Discard', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
    title: 'Unsaved Changes',
    message: `${filename} has unsaved changes.`,
    detail: 'Save before closing this document?'
  }
  const result = window
    ? await dialog.showMessageBox(window, dialogOptions)
    : await dialog.showMessageBox(dialogOptions)

  if (result.response === 0) {
    return 'save'
  }

  if (result.response === 1) {
    return 'discard'
  }

  return 'cancel'
}
