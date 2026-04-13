import { dialog, type BrowserWindow, type MessageBoxOptions } from 'electron'
import type { DirtyDocumentSummary } from '@shared/contracts'

export type UnsavedChangesDecision = 'save' | 'discard' | 'cancel'

export const summarizeDirtyDocuments = (dirtyDocuments: DirtyDocumentSummary[]) => {
  const detailLines = dirtyDocuments.length === 0
    ? ['There are unsaved documents in this window.']
    : dirtyDocuments.slice(0, 6).map(document => `- ${document.filename}`)

  if (dirtyDocuments.length > 6) {
    detailLines.push(`- ...and ${dirtyDocuments.length - 6} more`)
  }

  return `${detailLines.join('\n')}\n\nSave changes before closing the window?`
}

export const createUnsavedChangesDialogOptions = (
  dirtyDocuments: DirtyDocumentSummary[]
): MessageBoxOptions => ({
  type: 'warning',
  buttons: ['Save All', 'Discard', 'Cancel'],
  defaultId: 0,
  cancelId: 2,
  noLink: true,
  title: 'Unsaved Changes',
  message: dirtyDocuments.length === 1
    ? `${dirtyDocuments[0].filename} has unsaved changes.`
    : 'There are unsaved documents in this window.',
  detail: summarizeDirtyDocuments(dirtyDocuments)
})

export const mapUnsavedChangesResponse = (response: number): UnsavedChangesDecision => {
  if (response === 0) {
    return 'save'
  }

  if (response === 1) {
    return 'discard'
  }

  return 'cancel'
}

export const showUnsavedChangesDialog = async (
  window: BrowserWindow,
  dirtyDocuments: DirtyDocumentSummary[]
) => {
  const result = await dialog.showMessageBox(
    window,
    createUnsavedChangesDialogOptions(dirtyDocuments)
  )

  return mapUnsavedChangesResponse(result.response)
}

export const showCloseCanceledDialog = async (window: BrowserWindow) => {
  await dialog.showMessageBox(window, {
    type: 'info',
    buttons: ['OK'],
    defaultId: 0,
    noLink: true,
    title: 'Close Canceled',
    message: 'The window was not closed because some documents were not saved.',
    detail: 'Finish saving the remaining documents, then try closing the window again.'
  })
}
