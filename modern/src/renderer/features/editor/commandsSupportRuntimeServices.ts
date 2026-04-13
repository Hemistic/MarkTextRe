import { removeRecentDocument } from '../../services/files'

export interface EditorCommandsSupportRuntimeServices {
  removeRecentDocument: typeof removeRecentDocument
}

export const createEditorCommandsSupportRuntimeServices = (): EditorCommandsSupportRuntimeServices => ({
  removeRecentDocument
})
