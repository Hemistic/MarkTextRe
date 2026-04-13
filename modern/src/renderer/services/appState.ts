import type {
  AppBootstrap,
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
