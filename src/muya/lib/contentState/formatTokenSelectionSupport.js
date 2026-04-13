import selection from '../selection'
import { tokenizer } from '../parser/'
import { checkTokenIsInlineFormat } from './formatTokenSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const selectionFormats = (contentState, { start, end } = selection.getCursorRange()) => {
  if (!start || !end) {
    return { formats: [], tokens: [], neighbors: [] }
  }

  const startBlock = contentState.getBlock(start.key)
  if (!startBlock) {
    return { formats: [], tokens: [], neighbors: [] }
  }
  const formats = []
  const neighbors = []
  let tokens = []
  if (start.key === end.key) {
    const { text } = startBlock
    tokens = tokenizer(text, {
      options: getContentStateOptions(contentState)
    })
    ;(function iterator (tks) {
      for (const token of tks) {
        if (
          checkTokenIsInlineFormat(token) &&
          start.offset >= token.range.start &&
          end.offset <= token.range.end
        ) {
          formats.push(token)
        }
        if (
          checkTokenIsInlineFormat(token) &&
          ((start.offset >= token.range.start && start.offset <= token.range.end) ||
          (end.offset >= token.range.start && end.offset <= token.range.end) ||
          (start.offset <= token.range.start && token.range.end <= end.offset))
        ) {
          neighbors.push(token)
        }
        if (token.children && token.children.length) {
          iterator(token.children)
        }
      }
    })(tokens)
  }

  return { formats, tokens, neighbors }
}
