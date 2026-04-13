import type { MarkTextWindowApi } from '@shared/contracts'
import { getMarkTextApi } from './api'

export type LogError = (message?: unknown, ...optionalParams: unknown[]) => void

export const callNativeWindowClose = () => {
  if (typeof window !== 'undefined' && typeof window.close === 'function') {
    window.close()
  }
}

export const createMissingWindowAction = (
  logError: LogError,
  actionName: string,
  fallback?: () => void
) => {
  return async () => {
    logError(`[modern] window ${actionName} bridge is unavailable`)
    fallback?.()
  }
}

export const resolveWindowApiMethod = (
  windowApi: MarkTextWindowApi | null | undefined,
  methodName: keyof MarkTextWindowApi
) => {
  return windowApi?.[methodName] ?? getMarkTextApi()?.window?.[methodName]
}

export const createWindowAction = (
  windowApi: MarkTextWindowApi | null | undefined,
  methodName: keyof MarkTextWindowApi,
  logError: LogError,
  actionName: string,
  fallback?: () => void
) => {
  return resolveWindowApiMethod(windowApi, methodName)
    ?? createMissingWindowAction(logError, actionName, fallback)
}
