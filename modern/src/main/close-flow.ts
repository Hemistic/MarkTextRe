import type { BrowserWindow } from 'electron'
import type { DirtyDocumentSummary } from '@shared/contracts'
import {
  showCloseCanceledDialog,
  showUnsavedChangesDialog
} from './close-dialogs'

export interface WindowCloseFlowDependencies {
  finalizeWindowClose: (window: BrowserWindow) => void
  getDirtyDocuments: (window: BrowserWindow) => Promise<DirtyDocumentSummary[]>
  saveAllDirtyDocuments: (window: BrowserWindow) => Promise<boolean>
  showCloseCanceledDialog: typeof showCloseCanceledDialog
  showUnsavedChangesDialog: typeof showUnsavedChangesDialog
}

export const handleWindowCloseRequest = async (
  window: BrowserWindow,
  {
    finalizeWindowClose,
    getDirtyDocuments,
    saveAllDirtyDocuments,
    showCloseCanceledDialog,
    showUnsavedChangesDialog
  }: WindowCloseFlowDependencies
) => {
  const dirtyDocuments = await getDirtyDocuments(window)
  const decision = await showUnsavedChangesDialog(window, dirtyDocuments)

  if (decision === 'cancel') {
    return
  }

  if (decision === 'save') {
    const saved = await saveAllDirtyDocuments(window)
    if (!saved) {
      await showCloseCanceledDialog(window)
      return
    }
  }

  finalizeWindowClose(window)
}
