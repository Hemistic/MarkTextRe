import type { MarkTextAppApi } from '@shared/contracts'
import { getMarkTextApi } from './api'

export const getAppApi = (): MarkTextAppApi | null => {
  return getMarkTextApi()?.app ?? null
}

export const withAppApi = <T>(fn: (appApi: MarkTextAppApi) => T): T | null => {
  const api = getAppApi()
  return api ? fn(api) : null
}
