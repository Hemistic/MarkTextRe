import { tokenizer, generator } from '../parser/'
import { getContentStateOptions } from './runtimeOptionSupport'

export const handleSpecialBackspaceToken = (contentState, startBlock, start, end) => {
  const { text } = startBlock
  const tokens = tokenizer(text, {
    options: getContentStateOptions(contentState)
  })
  let needRender = false
  let preToken = null
  for (const token of tokens) {
    if (
      token.range.end === start.offset &&
      token.type === 'inline_math'
    ) {
      needRender = true
      token.raw = token.raw.substr(0, token.raw.length - 1)
      break
    }
    if (
      token.range.start + 1 === start.offset &&
      preToken &&
      preToken.type === 'html_tag' &&
      preToken.tag === 'ruby'
    ) {
      needRender = true
      token.raw = token.raw.substr(1)
      break
    }
    preToken = token
  }
  if (needRender) {
    startBlock.text = generator(tokens)
    start.offset--
    end.offset--
    contentState.cursor = {
      start,
      end
    }
    contentState.partialRender()
    return true
  }

  return false
}
