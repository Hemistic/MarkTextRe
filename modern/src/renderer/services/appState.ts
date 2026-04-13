import type {
  AppBootstrap,
  EditorSessionState,
  RecentDocument
} from '@shared/contracts'
import { getAppApi } from './appApi'
import { fetchRecentDocuments } from './files'

export interface BootstrapState {
  bootstrap: AppBootstrap
  recentDocuments: RecentDocument[]
  sessionState: EditorSessionState | null
}

export const loadBootstrapState = async (): Promise<BootstrapState | null> => {
  const app = getAppApi()
  if (!app) {
    return null
  }

  const [bootstrap, recentDocuments, sessionState] = await Promise.all([
    app.getBootstrap(),
    fetchRecentDocuments(),
    app.getSessionState()
  ])

  return {
    bootstrap,
    recentDocuments,
    sessionState
  }
}

export const persistSessionState = async (sessionState: EditorSessionState) => {
  const app = getAppApi()
  if (!app) {
    return
  }

  await app.setSessionState(sessionState)
}

export const syncDirtyState = async (hasDirtyDocuments: boolean) => {
  const app = getAppApi()
  if (!app) {
    return
  }

  await app.setDirtyState(hasDirtyDocuments)
}
