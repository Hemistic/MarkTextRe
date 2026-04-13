import { BRACKET_HASH, BACK_HASH } from './inputAutoPairRuleSupport'

export const handleAutoPairDeletion = (text, block, start, end, event) => {
  let needRender = false
  const { offset } = start
  const inputChar = text.charAt(+offset - 1)
  const postInputChar = text.charAt(+offset)

  if (/^delete/.test(event.inputType)) {
    const deletedChar = block.text[offset]
    if (event.inputType === 'deleteContentBackward' && postInputChar === BRACKET_HASH[deletedChar]) {
      needRender = true
      text = text.substring(0, offset) + text.substring(offset + 1)
    }
    if (event.inputType === 'deleteContentForward' && inputChar === BACK_HASH[deletedChar]) {
      needRender = true
      start.offset -= 1
      end.offset -= 1
      text = text.substring(0, offset - 1) + text.substring(offset)
    }
  }

  return { needRender, text }
}
