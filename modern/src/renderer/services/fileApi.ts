import type { MarkTextFilesApi } from '@shared/contracts'
import { getMarkTextApi } from './api'

export const getFilesApi = (): MarkTextFilesApi | null => {
  return getMarkTextApi()?.files ?? null
}

export const withFilesApi = <T>(fn: (filesApi: MarkTextFilesApi) => T): T | null => {
  const api = getFilesApi()
  return api ? fn(api) : null
}

export const invokeFilesAction = async <T>(
  action: (filesApi: MarkTextFilesApi) => Promise<T>,
  defaultValue: T
): Promise<T> => {
  const api = getFilesApi()
  return api ? action(api) : defaultValue
}

export const invokeFilesNotification = async (
  action: (filesApi: MarkTextFilesApi) => Promise<void>
) => {
  const api = getFilesApi()
  if (!api) {
    return
  }

  await action(api)
}
