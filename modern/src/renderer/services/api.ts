import type { MarkTextApi } from '@shared/contracts'

export const getMarkTextApi = (): MarkTextApi | null => {
  if (typeof window === 'undefined' || !window.marktext) {
    return null
  }

  return window.marktext
}

export const hasMarkTextBridge = () => Boolean(getMarkTextApi())
