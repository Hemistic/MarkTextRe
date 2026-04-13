import { union } from '../utils'

export const applyTokenHighlights = (tokens, highlights) => {
  for (const token of tokens) {
    for (const light of highlights) {
      const highlight = union(token.range, light)
      if (highlight) {
        if (token.highlights && Array.isArray(token.highlights)) {
          token.highlights.push(highlight)
        } else {
          token.highlights = [highlight]
        }
      }
    }
    if (token.children && Array.isArray(token.children)) {
      applyTokenHighlights(token.children, highlights)
    }
  }
}

export const generator = tokens => {
  let result = ''
  for (const token of tokens) {
    result += token.raw
  }
  return result
}
