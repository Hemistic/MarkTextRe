import { beginRules, inlineRules, inlineExtensionRules } from './rules'
import { tokenizerFac } from './tokenizerSupport'
import { createValidateRules } from './tokenizerRuleSupport'
import { applyTokenHighlights, generator } from './tokenizerRenderSupport'

export const tokenizer = (src, {
  highlights = [],
  hasBeginRules = true,
  labels = new Map(),
  options = {}
} = {}) => {
  const rules = Object.assign({}, inlineRules, inlineExtensionRules)
  const validateRules = createValidateRules(rules)
  const tokens = tokenizerFac(src, hasBeginRules ? beginRules : null, rules, validateRules, 0, true, labels, options)

  if (highlights.length) {
    applyTokenHighlights(tokens, highlights)
  }

  return tokens
}

export { generator }
