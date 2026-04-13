import { tokenizer } from '../parser/'
import { getContentStateOptions } from './runtimeOptionSupport'

export const checkCursorInTokenType = (contentState, functionType, text, offset, type) => {
  if (!/atxLine|paragraphContent|cellContent/.test(functionType)) {
    return false
  }

  const tokens = tokenizer(text, {
    hasBeginRules: false,
    options: getContentStateOptions(contentState)
  })
  return tokens
    .filter(token => token.type === type)
    .some(token => offset >= token.range.start && offset <= token.range.end)
}

export const checkNotSameToken = (contentState, functionType, oldText, text) => {
  if (!/atxLine|paragraphContent|cellContent/.test(functionType)) {
    return false
  }

  const oldTokens = tokenizer(oldText, {
    options: getContentStateOptions(contentState)
  })
  const tokens = tokenizer(text, {
    options: getContentStateOptions(contentState)
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
