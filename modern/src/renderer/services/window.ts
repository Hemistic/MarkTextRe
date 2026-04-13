import type { MarkTextWindowApi } from '@shared/contracts'
import {
  callNativeWindowClose,
  createWindowActionInvoker,
  LogError,
  type WindowActionInvocationDefinition
} from './windowActionSupport'

export interface WindowActions {
  closeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  minimizeWindow: () => Promise<void>
  toggleDevToolsWindow: () => Promise<void>
}

export const createWindowActions = (
  windowApi: MarkTextWindowApi | null | undefined = undefined,
  logError: LogError = console.error
): WindowActions => {
  const definitions: Record<keyof WindowActions, WindowActionInvocationDefinition> = {
    minimizeWindow: { methodName: 'minimize', actionName: 'minimize' },
    maximizeWindow: { methodName: 'maximize', actionName: 'maximize' },
    closeWindow: { methodName: 'close', actionName: 'close', fallback: callNativeWindowClose },
    toggleDevToolsWindow: { methodName: 'toggleDevTools', actionName: 'toggle-dev-tools' }
  }

  const entries = Object.entries(definitions).map(([key, definition]) => [key, createWindowActionInvoker(windowApi, logError, definition)])

  return Object.fromEntries(entries) as WindowActions
}

export const {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  toggleDevToolsWindow
} = createWindowActions()
