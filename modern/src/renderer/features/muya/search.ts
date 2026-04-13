import type { MuyaEditorInstance } from './types'

export interface MuyaSearchStatus {
  total: number
  activeIndex: number
}

export const getMuyaSearchStatus = (
  editor: Pick<MuyaEditorInstance, 'contentState'> | null | undefined
): MuyaSearchStatus => {
  const searchMatches = editor?.contentState?.searchMatches
  const total = Array.isArray(searchMatches?.matches) ? searchMatches.matches.length : 0
  const activeIndex = typeof searchMatches?.index === 'number' && searchMatches.index >= 0
    ? searchMatches.index
    : -1

  return {
    total,
    activeIndex
  }
}

const DEFAULT_SEARCH_OPTIONS = {
  isCaseSensitive: false,
  isWholeWord: false,
  isRegexp: false,
  selectHighlight: true
}

export const searchMuyaDocument = (
  editor: Pick<MuyaEditorInstance, 'search' | 'contentState'> | null | undefined,
  value: string
) => {
  editor?.search?.(value, DEFAULT_SEARCH_OPTIONS)
  return getMuyaSearchStatus(editor)
}

export const stepMuyaSearch = (
  editor: Pick<MuyaEditorInstance, 'find' | 'contentState'> | null | undefined,
  direction: 'prev' | 'next'
) => {
  editor?.find?.(direction === 'prev' ? 'pre' : 'next')
  return getMuyaSearchStatus(editor)
}
