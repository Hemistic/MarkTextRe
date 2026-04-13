import { findClosingBracket } from './marked/utils'

export const createValidateRules = inlineRules => {
  const validateRules = Object.assign({}, inlineRules)
  delete validateRules.em
  delete validateRules.strong
  delete validateRules.tail_header
  delete validateRules.backlash
  return validateRules
}

export const correctUrl = token => {
  if (token && typeof token[4] === 'string') {
    const lastParenIndex = findClosingBracket(token[4], '()')

    if (lastParenIndex > -1) {
      const len = token[0].length - (token[4].length - lastParenIndex)
      token[0] = token[0].substring(0, len)
      const originSrc = token[4].substring(0, lastParenIndex)
      const match = /(\\+)$/.exec(originSrc)
      if (match) {
        token[4] = originSrc.substring(0, originSrc.length - match[1].length)
        token[5] = match[1]
      } else {
        token[4] = originSrc
        token[5] = ''
      }
    }
  }
}

export const matchHtmlTag = (src, disableHtml, inlineRules) => {
  const match = inlineRules.html_tag.exec(src)
  if (!match) {
    return null
  }

  if (disableHtml && (!match[3] || !/^img$/i.test(match[3]))) {
    return null
  }
  return match
}
