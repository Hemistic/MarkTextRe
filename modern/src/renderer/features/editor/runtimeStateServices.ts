import { fetchRecentDocuments } from '../../services/files'

export interface EditorRuntimeStateServices {
  fetchRecentDocuments: typeof fetchRecentDocuments
}

export const createEditorRuntimeStateServices = (): EditorRuntimeStateServices => ({
  fetchRecentDocuments
})
