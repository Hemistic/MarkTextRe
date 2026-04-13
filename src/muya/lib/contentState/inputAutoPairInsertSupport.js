import { BRACKET_HASH } from './inputAutoPairRuleSupport'
import { checkCursorInTokenType } from './inputTokenSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const handleAutoPairInsertion = (contentState, block, text, start, event) => {
  let needRender = false
  const { offset } = start
  const { autoPairBracket, autoPairMarkdownSyntax, autoPairQuote } = getContentStateOptions(contentState)
  const inputChar = text.charAt(+offset - 1)
  const preInputChar = text.charAt(+offset - 2)
  const prePreInputChar = text.charAt(+offset - 3)
  const postInputChar = text.charAt(+offset)

  if (
    (event.inputType.indexOf('delete') === -1) &&
    (inputChar === postInputChar) &&
    (
      (autoPairQuote && /[']{1}/.test(inputChar)) ||
      (autoPairQuote && /["]{1}/.test(inputChar)) ||
      (autoPairBracket && /[\}\]\)]{1}/.test(inputChar)) ||
      (autoPairMarkdownSyntax && /[$]{1}/.test(inputChar)) ||
      (autoPairMarkdownSyntax && /[*$`~_]{1}/.test(inputChar)) && /[_*~]{1}/.test(prePreInputChar)
    )
  ) {
    needRender = true
    text = text.substring(0, offset) + text.substring(offset + 1)
  } else {
    const isInInlineMath = checkCursorInTokenType(contentState, block.functionType, text, offset, 'inline_math')
    const isInInlineCode = checkCursorInTokenType(contentState, block.functionType, text, offset, 'inline_code')
    if (
      !/\\/.test(preInputChar) &&
      ((autoPairQuote && /[']{1}/.test(inputChar) && !(/[\S]{1}/.test(postInputChar)) && !(/[a-zA-Z\d]{1}/.test(preInputChar))) ||
        (autoPairQuote && /["]{1}/.test(inputChar) && !(/[\S]{1}/.test(postInputChar))) ||
        (autoPairBracket && /[\{\[\(]{1}/.test(inputChar) && !(/[\S]{1}/.test(postInputChar))) ||
        (block.functionType !== 'codeContent' && !isInInlineMath && !isInInlineCode && autoPairMarkdownSyntax && !/[a-z0-9]{1}/i.test(preInputChar) && /[*$`~_]{1}/.test(inputChar)))
    ) {
      needRender = true
      text = BRACKET_HASH[event.data]
        ? text.substring(0, offset) + BRACKET_HASH[inputChar] + text.substring(offset)
        : text
    }
    if (
      /\s/.test(event.data) &&
      /^\* /.test(text) &&
      preInputChar === '*' &&
      postInputChar === '*'
    ) {
      text = text.substring(0, offset) + text.substring(offset + 1)
      needRender = true
    }
  }

  return { needRender, text }
}
