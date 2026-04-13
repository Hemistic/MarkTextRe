import type {
  AppCommandMessage,
  CloseDocumentAction,
  DirtyDocumentSummary
} from '@shared/contracts'
import { getMarkTextApi } from './api'

export interface WindowCloseCoordinator {
  getDirtyDocuments: () => Promise<DirtyDocumentSummary[]>
  saveAllDirtyDocuments: () => Promise<boolean>
}

export type AppCommandHandler = (message: AppCommandMessage) => void

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
