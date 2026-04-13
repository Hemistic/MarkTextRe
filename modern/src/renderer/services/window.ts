import type { MarkTextWindowApi } from '@shared/contracts'
import { getMarkTextApi } from './api'

export interface WindowActions {
  closeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  minimizeWindow: () => Promise<void>
  toggleDevToolsWindow: () => Promise<void>
}

type LogError = (message?: unknown, ...optionalParams: unknown[]) => void

const createMissingWindowAction = (logError: LogError, actionName: string) => {
  return async () => {
    logError(`[modern] window ${actionName} bridge is unavailable`)
  }
}

export const createWindowActions = (
  windowApi: MarkTextWindowApi | null | undefined = getMarkTextApi()?.window,
  logError: LogError = console.error
): WindowActions => ({
  minimizeWindow: windowApi?.minimize ?? createMissingWindowAction(logError, 'minimize'),
  maximizeWindow: windowApi?.maximize ?? createMissingWindowAction(logError, 'maximize'),
  closeWindow: windowApi?.close ?? createMissingWindowAction(logError, 'close'),
  toggleDevToolsWindow: windowApi?.toggleDevTools ?? createMissingWindowAction(logError, 'toggle-dev-tools')
})

export const {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  toggleDevToolsWindow
} = createWindowActions()
