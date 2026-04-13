import { defaultSearchOption } from '../config'
import { matchString } from './searchRegexSupport'

export const setCursorToHighlight = contentState => {
  const { matches, index } = contentState.searchMatches
  const match = matches[index]

  if (!match) return
  const { key, start, end } = match

  contentState.cursor = {
    noHistory: true,
    start: {
      key,
      offset: start
    },
    end: {
      key,
      offset: end
    }
  }
}

export const findInSearchMatches = (contentState, action) => {
  let { matches, index } = contentState.searchMatches
  const len = matches.length
  if (!len) return
  index = action === 'next' ? index + 1 : index - 1
  if (index < 0) index = len - 1
  if (index >= len) index = 0
  contentState.searchMatches.index = index

  setCursorToHighlight(contentState)
}

export const searchInContent = (contentState, value, opt = {}) => {
  const matches = []
  const options = Object.assign({}, defaultSearchOption, opt)
  const { highlightIndex } = options
  const { blocks } = contentState

  const travel = blocks => {
    for (const block of blocks) {
      const { text, key } = block

      if (text && typeof text === 'string') {
        const strMatches = matchString(text, value, options)
        matches.push(...strMatches.map(({ index, match, subMatches }) => ({
          key,
          start: index,
          end: index + match.length,
          match,
          subMatches
        })))
      }
      if (block.children.length) {
        travel(block.children)
      }
    }
  }

  if (value) travel(blocks)
  let index = -1
  if (highlightIndex !== -1) {
    index = highlightIndex
  } else if (matches.length) {
    index = 0
  }
  Object.assign(contentState.searchMatches, { value, matches, index })
  if (value) {
    setCursorToHighlight(contentState)
  }
  return matches
}
