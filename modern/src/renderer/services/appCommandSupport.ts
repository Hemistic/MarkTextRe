import type {
  CloseDocumentAction,
  MarkTextAppApi,
  WindowCloseCoordinator
} from '@shared/contracts'
import type { AppCommandHandler } from './appCommands'

type ConfirmCloseDialog = (message: string) => boolean

export const resolveCloseDocumentAction = async (
  app: MarkTextAppApi | null,
  filename: string,
  confirmClose: ConfirmCloseDialog = message => window.confirm(message)
): Promise<CloseDocumentAction> => {
  if (app?.confirmCloseDocument) {
    return app.confirmCloseDocument(filename)
  }

  return confirmClose(`Close ${filename} without saving?`) ? 'discard' : 'cancel'
}

export const attachWindowCloseCoordinator = (
  app: MarkTextAppApi | null,
  coordinator: WindowCloseCoordinator
) => {
  app?.registerWindowCloseCoordinator?.(coordinator)
}

export const registerAppCommandHandlerWithFallback = (
  app: MarkTextAppApi | null,
  handler: AppCommandHandler
) => {
  return app?.registerAppCommandHandler?.(handler) ?? (() => {})
}
