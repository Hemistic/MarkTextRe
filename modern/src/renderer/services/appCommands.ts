import type {
  AppCommandMessage,
  CloseDocumentAction,
  WindowCloseCoordinator
} from '@shared/contracts'
import { getAppApi } from './appApi'
import {
  attachWindowCloseCoordinator,
  registerAppCommandHandlerWithFallback,
  resolveCloseDocumentAction
} from './appCommandSupport'

export type AppCommandHandler = (message: AppCommandMessage) => void

export const confirmCloseDocument = async (filename: string): Promise<CloseDocumentAction> => {
  return resolveCloseDocumentAction(getAppApi(), filename)
}

export const registerWindowCloseCoordinator = (coordinator: WindowCloseCoordinator) => {
  attachWindowCloseCoordinator(getAppApi(), coordinator)
}

export const registerAppCommandHandler = (handler: AppCommandHandler) => {
  return registerAppCommandHandlerWithFallback(getAppApi(), handler)
}
