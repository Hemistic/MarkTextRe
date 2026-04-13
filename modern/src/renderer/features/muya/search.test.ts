import { describe, expect, it, vi } from 'vitest'
import {
  getMuyaSearchStatus,
  searchMuyaDocument,
  stepMuyaSearch
} from './search'

describe('muya search helpers', () => {
  it('returns an empty status when no matches are present', () => {
    expect(getMuyaSearchStatus(null)).toEqual({
      total: 0,
      activeIndex: -1
    })
  })

  it('derives search status from contentState matches', () => {
    expect(getMuyaSearchStatus({
      contentState: {
        searchMatches: {
          index: 2,
          matches: ['a', 'b', 'c']
        }
      }
    })).toEqual({
      total: 3,
      activeIndex: 2
    })
  })

  it('runs search with the default options', () => {
    const search = vi.fn()
    const editor = {
      search,
      contentState: {
        searchMatches: {
          index: 0,
          matches: ['hit']
        }
      }
    }

    expect(searchMuyaDocument(editor, 'marktext')).toEqual({
      total: 1,
      activeIndex: 0
    })
    expect(search).toHaveBeenCalledWith('marktext', {
      isCaseSensitive: false,
      isWholeWord: false,
      isRegexp: false,
      selectHighlight: false
    })
  })

  it('steps search direction through Muya', () => {
    const find = vi.fn()
    const editor = {
      find,
      contentState: {
        searchMatches: {
          index: 1,
          matches: ['a', 'b']
        }
      }
    }

    expect(stepMuyaSearch(editor, 'prev')).toEqual({
      total: 2,
      activeIndex: 1
    })
    expect(find).toHaveBeenCalledWith('pre')
  })
})
