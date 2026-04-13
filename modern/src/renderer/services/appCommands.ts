import type {
  AppCommandMessage,
  CloseDocumentAction,
  WindowCloseCoordinator
} from '@shared/contracts'
import { getMarkTextApi } from './api'

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
