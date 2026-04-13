import { HAS_TEXT_BLOCK_REG } from '../config'
import { tokenizer } from '../parser'
import { findCursorAtEndFormat } from './tabFormatTokenSupport'
import { getContentStateLabels } from './runtimeRenderAccessSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const checkCursorAtEndFormat = (contentState, text, offset) => {
  const labels = getContentStateLabels(contentState)
  const tokens = tokenizer(text, {
    hasBeginRules: false,
    labels,
    options: getContentStateOptions(contentState)
  })
  return findCursorAtEndFormat(tokens, offset)
}

export const tryJumpOutOfFormat = (contentState, start, end, startBlock) => {
  if (
    start.key === end.key &&
    start.offset === end.offset &&
    HAS_TEXT_BLOCK_REG.test(startBlock.type) &&
    startBlock.functionType !== 'codeContent' &&
    startBlock.functionType !== 'languageInput'
  ) {
    const { text, key } = startBlock
    const { offset } = start
    const atEnd = checkCursorAtEndFormat(contentState, text, offset)
    if (atEnd) {
      contentState.cursor = {
        start: { key, offset: offset + atEnd.offset },
        end: { key, offset: offset + atEnd.offset }
      }
      contentState.partialRender()
      return true
    }
  }

  return false
}
