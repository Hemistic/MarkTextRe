import { getTextContent } from '../selection/dom'
import { beginRules } from '../parser/rules'
import { tokenizer } from '../parser/'
import { CLASS_OR_ID } from '../config'

const BRACKET_HASH = {
  '{': '}',
  '[': ']',
  '(': ')',
  '*': '*',
  _: '_',
  '"': '"',
  '\'': '\'',
  $: '$',
  '~': '~'
}

const BACK_HASH = {
  '}': '{',
  ']': '[',
  ')': '(',
  '*': '*',
  _: '_',
  '"': '"',
  '\'': '\'',
  $: '$',
  '~': '~'
}

export const checkQuickInsert = block => {
  const { type, text, functionType } = block
  if (type !== 'span' || functionType !== 'paragraphContent') return false
  return /^@\S*$/.test(text)
}

export const checkCursorInTokenType = (contentState, functionType, text, offset, type) => {
  if (!/atxLine|paragraphContent|cellContent/.test(functionType)) {
    return false
  }

  const tokens = tokenizer(text, {
    hasBeginRules: false,
    options: contentState.muya.options
  })
  return tokens.filter(token => token.type === type).some(token => offset >= token.range.start && offset <= token.range.end)
}

export const checkNotSameToken = (contentState, functionType, oldText, text) => {
  if (!/atxLine|paragraphContent|cellContent/.test(functionType)) {
    return false
  }

  const oldTokens = tokenizer(oldText, {
    options: contentState.muya.options
  })
  const tokens = tokenizer(text, {
    options: contentState.muya.options
  })

  const oldCache = {}
  const cache = {}

  for (const { type } of oldTokens) {
    if (oldCache[type]) {
      oldCache[type]++
    } else {
      oldCache[type] = 1
    }
  }

  for (const { type } of tokens) {
    if (cache[type]) {
      cache[type]++
    } else {
      cache[type] = 1
    }
  }

  if (Object.keys(oldCache).length !== Object.keys(cache).length) {
    return true
  }

  for (const key of Object.keys(oldCache)) {
    if (!cache[key] || oldCache[key] !== cache[key]) {
      return true
    }
  }

  return false
}

export const collectInputText = paragraph => {
  return getTextContent(paragraph, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER])
}

export const applyAutoPair = (contentState, block, text, start, end, oldStart, event) => {
  let needRender = false

  if (
    start.key === end.key &&
    start.offset === end.offset &&
    event.type === 'input'
  ) {
    const { offset } = start
    const { autoPairBracket, autoPairMarkdownSyntax, autoPairQuote } = contentState.muya.options
    const inputChar = text.charAt(+offset - 1)
    const preInputChar = text.charAt(+offset - 2)
    const prePreInputChar = text.charAt(+offset - 3)
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
    } else if (
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
  }

  if (checkNotSameToken(contentState, block.functionType, block.text, text)) {
    needRender = true
  }

  if (
    block.text.endsWith('\n') &&
    start.offset === text.length &&
    (event.inputType === 'insertText' || event.type === 'compositionend')
  ) {
    block.text += event.data
    start.offset++
    end.offset++
  } else if (
    block.text.length === oldStart.offset &&
    block.text[oldStart.offset - 2] === '\n' &&
    event.inputType === 'deleteContentBackward'
  ) {
    block.text = block.text.substring(0, oldStart.offset - 1)
    start.offset = block.text.length
    end.offset = block.text.length
  } else {
    block.text = text
  }

  if (block.functionType === 'languageInput') {
    const parent = contentState.getParent(block)
    parent.lang = block.text
  }

  const needRenderAll = beginRules.reference_definition.test(text)

  return {
    needRender,
    needRenderAll,
    text: block.text
  }
}

export const createQuickInsertReference = (contentState, paragraph, block) => {
  const rect = paragraph.getBoundingClientRect()
  const reference = contentState.getPositionReference()
  reference.getBoundingClientRect = function () {
    const { x, y, left, top, height, bottom } = rect

    return Object.assign({}, {
      left,
      x,
      top,
      y,
      bottom,
      height,
      width: 0,
      right: left
    })
  }

  const show = !!checkQuickInsert(block)
  return { reference, show }
}
