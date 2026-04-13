import { tokenizer } from '../parser/'
import { conflict } from '../utils'
import { getContentStateLabels } from './runtimeRenderAccessSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

const NO_NEED_TOKEN_REG = /text|hard_line_break|soft_line_break/

export const hasTokenConflict = (contentState, block, offset) => {
  const labels = getContentStateLabels(contentState)
  for (const token of tokenizer(block.text, {
    labels,
    options: getContentStateOptions(contentState)
  })) {
    if (NO_NEED_TOKEN_REG.test(token.type)) continue
    const { start, end } = token.range
    const textLen = block.text.length
    if (
      conflict([Math.max(0, start - 1), Math.min(textLen, end + 1)], [offset, offset])
    ) {
      return true
    }
  }

  return false
}
