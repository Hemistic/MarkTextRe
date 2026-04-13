import { normal, gfm, pedantic } from './blockRules'

export const selectBlockRules = options => {
  if (options.pedantic) {
    return pedantic
  } else if (options.gfm) {
    return gfm
  }

  return normal
}

export const normalizeLexerSource = src => {
  return src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
}

export const reorderFootnoteTokens = tokens => {
  const hasNoFootnoteTokens = []
  const footnoteTokens = []
  let isInFootnote = false
  for (const token of tokens) {
    const { type } = token
    if (type === 'footnote_start') {
      isInFootnote = true
      footnoteTokens.push(token)
    } else if (type === 'footnote_end') {
      isInFootnote = false
      footnoteTokens.push(token)
    } else if (isInFootnote) {
      footnoteTokens.push(token)
    } else {
      hasNoFootnoteTokens.push(token)
    }
  }

  const result = [...hasNoFootnoteTokens, ...footnoteTokens]
  result.links = tokens.links
  result.footnotes = tokens.footnotes
  return result
}

export const normalizeFootnoteSource = raw => {
  let text = raw.replace(/^\[\^[^\^\[\]\s]+?(?<!\\)\]:\s*/gm, '')
  text = text.replace(/\n {4}(?=[^\s])/g, '\n')
  return text
}

export const normalizeBlockquoteSource = raw => raw.replace(/^ *> ?/gm, '')
