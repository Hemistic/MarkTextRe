import { DEVICE_MEMORY, HAS_TEXT_BLOCK_REG } from '../../../config'
import { tokenizer } from '../../'
import { snakeToCamel } from '../../../utils'
import { h } from '../snabbdom'

const hasReferenceToken = tokens => {
  let result = false
  const travel = nestedTokens => {
    for (const token of nestedTokens) {
      if (/reference_image|reference_link/.test(token.type)) {
        result = true
        break
      }
      if (Array.isArray(token.children) && token.children.length) {
        travel(token.children)
      }
    }
  }
  travel(tokens)
  return result
}

export const resolveLeafTokens = (stateRender, block, matches, useCache) => {
  const highlights = matches.filter(match => match.key === block.key)
  const { text, type, functionType } = block
  let tokens = []

  if (!text) {
    return { highlights, tokens }
  }

  if (highlights.length === 0 && stateRender.tokenCache.has(text)) {
    tokens = stateRender.tokenCache.get(text)
  } else if (
    HAS_TEXT_BLOCK_REG.test(type) &&
    functionType !== 'codeContent' &&
    functionType !== 'languageInput'
  ) {
    const hasBeginRules = /paragraphContent|atxLine/.test(functionType)

    tokens = tokenizer(text, {
      highlights,
      hasBeginRules,
      labels: stateRender.labels,
      options: stateRender.muya.options
    })
    const hasReferenceTokens = hasReferenceToken(tokens)
    if (highlights.length === 0 && useCache && DEVICE_MEMORY >= 4 && !hasReferenceTokens) {
      stateRender.tokenCache.set(text, tokens)
    }
  }

  return { highlights, tokens }
}

export const renderTokenChildren = (stateRender, block, cursor, tokens) => {
  return tokens.reduce((acc, token) => {
    return [...acc, ...stateRender[snakeToCamel(token.type)](h, cursor, block, token)]
  }, [])
}
