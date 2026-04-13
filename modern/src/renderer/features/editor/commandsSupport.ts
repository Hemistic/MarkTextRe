import type { EditorTab } from './types'
import { openPreparedDocumentWithTracking } from './commandSupport'
import { setStatusInState } from './state'
import type { EditorCommandState } from './commands'
import {
  createEditorCommandsSupportRuntimeServices,
  type EditorCommandsSupportRuntimeServices
} from './commandsSupportRuntimeServices'

type RefreshRecentDocuments = () => Promise<void>

export const findTabById = (tabs: EditorTab[], id: string) => {
  return tabs.find(tab => tab.id === id) ?? null
}

export const openTrackedDocumentInState = async (
  state: EditorCommandState,
  refreshRecentDocuments: RefreshRecentDocuments,
  document: EditorTab
) => {
  await openPreparedDocumentWithTracking(
    state,
    refreshRecentDocuments,
    document,
    `Opened ${document.filename}`
  )
}

export const handleMissingRecentDocumentInState = async (
  status: EditorCommandState['status'],
  refreshRecentDocuments: RefreshRecentDocuments,
  pathname: string,
  statusText: string,
  runtimeServices: EditorCommandsSupportRuntimeServices = createEditorCommandsSupportRuntimeServices()
) => {
  await runtimeServices.removeRecentDocument(pathname)
  await refreshRecentDocuments()
  setStatusInState(status, statusText)
}
