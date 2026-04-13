import { promises as fs } from 'node:fs'
import { dialog } from 'electron'
import type { BrowserWindow, MessageBoxOptions } from 'electron'
import type { CloseDocumentAction, OpenPathSelection } from '@shared/contracts'

const MARKDOWN_FILE_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'txt'] }
]

const IMAGE_FILE_FILTERS = [
  { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'] }
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

export const showOpenPathDialog = async (): Promise<OpenPathSelection[]> => {
  const result = await dialog.showOpenDialog({
    title: 'Open File or Folder',
    filters: MARKDOWN_FILE_FILTERS,
    properties: process.platform === 'darwin'
      ? ['openFile', 'openDirectory', 'multiSelections', 'createDirectory']
      : ['openFile', 'multiSelections']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  const selections = await Promise.all(result.filePaths.map(async pathname => {
    try {
      const stats = await fs.stat(pathname)
      return {
        kind: stats.isDirectory() ? 'folder' : 'file',
        pathname
      } satisfies OpenPathSelection
    } catch {
      return null
    }
  }))

  return selections.filter((selection): selection is OpenPathSelection => selection !== null)
}

export const showOpenImageDialog = async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Image',
    filters: IMAGE_FILE_FILTERS,
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
}

export const showOpenDirectoryDialog = async (defaultPath?: string | null) => {
  const result = await dialog.showOpenDialog({
    title: 'Select Folder',
    defaultPath: defaultPath ?? undefined,
    properties: ['openDirectory', 'createDirectory']
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
