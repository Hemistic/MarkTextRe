import type { MarkTextApi, MarkTextSettingsApi } from '@shared/contracts'
import { getMarkTextApi } from './api'

export const getSettingsApi = (): MarkTextSettingsApi | null => {
  return getMarkTextApi()?.settings ?? null
}

export const withSettingsApi = <T>(fn: (settingsApi: MarkTextSettingsApi) => T): T | null => {
  const api = getSettingsApi()
  return api ? fn(api) : null
}

export const invokeSettingsAction = async <T>(
  action: (settingsApi: MarkTextSettingsApi) => Promise<T>,
  defaultValue: T
): Promise<T> => {
  const api = getSettingsApi()
  return api ? action(api) : defaultValue
}

export const createStubSettingsBridge = (settings: MarkTextSettingsApi): MarkTextApi => ({
  app: {} as MarkTextApi['app'],
  files: {} as MarkTextApi['files'],
  settings,
  window: {} as MarkTextApi['window']
})
