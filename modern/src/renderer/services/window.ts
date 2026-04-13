import type { MarkTextWindowApi } from '@shared/contracts'
import {
  callNativeWindowClose,
  createWindowAction,
  type LogError
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
): WindowActions => ({
  minimizeWindow: async () => createWindowAction(windowApi, 'minimize', logError, 'minimize')(),
  maximizeWindow: async () => createWindowAction(windowApi, 'maximize', logError, 'maximize')(),
  closeWindow: async () => createWindowAction(windowApi, 'close', logError, 'close', callNativeWindowClose)(),
  toggleDevToolsWindow: async () => createWindowAction(windowApi, 'toggleDevTools', logError, 'toggle-dev-tools')()
})

export const {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  toggleDevToolsWindow
} = createWindowActions()
