import { describe, expect, it } from 'vitest'
import {
  createUnsavedChangesDialogOptions,
  mapUnsavedChangesResponse,
  summarizeDirtyDocuments
} from './close-dialogs'

describe('close dialogs', () => {
  it('summarizes unsaved documents and truncates long lists', () => {
    expect(summarizeDirtyDocuments([
      { id: '1', filename: 'a.md' },
      { id: '2', filename: 'b.md' }
    ])).toContain('- a.md')

    expect(summarizeDirtyDocuments([
      { id: '1', filename: '1.md' },
      { id: '2', filename: '2.md' },
      { id: '3', filename: '3.md' },
      { id: '4', filename: '4.md' },
      { id: '5', filename: '5.md' },
      { id: '6', filename: '6.md' },
      { id: '7', filename: '7.md' }
    ])).toContain('...and 1 more')
  })

  it('creates dialog options with a single-document message', () => {
    expect(createUnsavedChangesDialogOptions([
      { id: '1', filename: 'draft.md' }
    ])).toMatchObject({
      title: 'Unsaved Changes',
      message: 'draft.md has unsaved changes.',
      buttons: ['Save All', 'Discard', 'Cancel']
    })
  })

  it('maps dialog responses to close decisions', () => {
    expect(mapUnsavedChangesResponse(0)).toBe('save')
    expect(mapUnsavedChangesResponse(1)).toBe('discard')
    expect(mapUnsavedChangesResponse(2)).toBe('cancel')
  })
})
