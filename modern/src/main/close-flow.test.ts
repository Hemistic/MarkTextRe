import { describe, expect, it, vi } from 'vitest'
import type { BrowserWindow } from 'electron'
import type { DirtyDocumentSummary } from '@shared/contracts'
import { handleWindowCloseRequest } from './close-flow'

const createWindow = (id: number) => ({ id }) as BrowserWindow
const dirtyDocuments: DirtyDocumentSummary[] = [
  {
    id: 'tab-1',
    filename: 'draft.md'
  }
]

describe('close-flow', () => {
  it('stops when the user cancels the close dialog', async () => {
    const getDirtyDocuments = vi.fn(async () => dirtyDocuments)
    const saveAllDirtyDocuments = vi.fn(async () => true)
    const showCloseCanceledDialog = vi.fn(async () => {})
    const showUnsavedChangesDialog = vi.fn(async () => 'cancel' as const)
    const finalizeWindowClose = vi.fn()

    await handleWindowCloseRequest(createWindow(1), {
      finalizeWindowClose,
      getDirtyDocuments,
      saveAllDirtyDocuments,
      showCloseCanceledDialog,
      showUnsavedChangesDialog
    })

    expect(getDirtyDocuments).toHaveBeenCalledOnce()
    expect(showUnsavedChangesDialog).toHaveBeenCalledOnce()
    expect(saveAllDirtyDocuments).not.toHaveBeenCalled()
    expect(showCloseCanceledDialog).not.toHaveBeenCalled()
    expect(finalizeWindowClose).not.toHaveBeenCalled()
  })

  it('finalizes immediately when the user discards dirty documents', async () => {
    const getDirtyDocuments = vi.fn(async () => dirtyDocuments)
    const saveAllDirtyDocuments = vi.fn(async () => true)
    const showCloseCanceledDialog = vi.fn(async () => {})
    const showUnsavedChangesDialog = vi.fn(async () => 'discard' as const)
    const finalizeWindowClose = vi.fn()

    await handleWindowCloseRequest(createWindow(2), {
      finalizeWindowClose,
      getDirtyDocuments,
      saveAllDirtyDocuments,
      showCloseCanceledDialog,
      showUnsavedChangesDialog
    })

    expect(saveAllDirtyDocuments).not.toHaveBeenCalled()
    expect(showCloseCanceledDialog).not.toHaveBeenCalled()
    expect(finalizeWindowClose).toHaveBeenCalledOnce()
  })

  it('shows the cancellation dialog when save-all fails', async () => {
    const getDirtyDocuments = vi.fn(async () => dirtyDocuments)
    const saveAllDirtyDocuments = vi.fn(async () => false)
    const showCloseCanceledDialog = vi.fn(async () => {})
    const showUnsavedChangesDialog = vi.fn(async () => 'save' as const)
    const finalizeWindowClose = vi.fn()

    await handleWindowCloseRequest(createWindow(3), {
      finalizeWindowClose,
      getDirtyDocuments,
      saveAllDirtyDocuments,
      showCloseCanceledDialog,
      showUnsavedChangesDialog
    })

    expect(saveAllDirtyDocuments).toHaveBeenCalledOnce()
    expect(showCloseCanceledDialog).toHaveBeenCalledOnce()
    expect(finalizeWindowClose).not.toHaveBeenCalled()
  })
})
