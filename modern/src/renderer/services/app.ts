import type {
  AppCommandMessage,
  AppBootstrap,
  CloseDocumentAction,
  DirtyDocumentSummary,
  EditorSessionState,
  RecentDocument
} from '@shared/contracts'
import { getMarkTextApi } from './api'
import { fetchRecentDocuments } from './files'

export interface BootstrapState {
  bootstrap: AppBootstrap
  recentDocuments: RecentDocument[]
  sessionState: EditorSessionState | null
}

export interface WindowCloseCoordinator {
  getDirtyDocuments: () => Promise<DirtyDocumentSummary[]>
  saveAllDirtyDocuments: () => Promise<boolean>
}

export type AppCommandHandler = (message: AppCommandMessage) => void

export const loadBootstrapState = async (): Promise<BootstrapState | null> => {
  const api = getMarkTextApi()
  if (!api) {
    return null
  }

  const [bootstrap, recentDocuments, sessionState] = await Promise.all([
    api.app.getBootstrap(),
    fetchRecentDocuments(),
    api.app.getSessionState()
  ])

  return {
    bootstrap,
    recentDocuments,
    sessionState
  }
}

export const persistSessionState = async (sessionState: EditorSessionState) => {
  await getMarkTextApi()?.app.setSessionState(sessionState)
}

export const syncDirtyState = async (hasDirtyDocuments: boolean) => {
  await getMarkTextApi()?.app.setDirtyState(hasDirtyDocuments)
}

export const confirmCloseDocument = async (filename: string): Promise<CloseDocumentAction> => {
  const api = getMarkTextApi()
  if (api?.app.confirmCloseDocument) {
    return api.app.confirmCloseDocument(filename)
  }

  return window.confirm(`Close ${filename} without saving?`) ? 'discard' : 'cancel'
}

export const registerWindowCloseCoordinator = (coordinator: WindowCloseCoordinator) => {
  getMarkTextApi()?.app.registerWindowCloseCoordinator?.(coordinator)
}

export const registerAppCommandHandler = (handler: AppCommandHandler) => {
  return getMarkTextApi()?.app.registerAppCommandHandler?.(handler) ?? (() => {})
}
