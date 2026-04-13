import { normalizeLexerSource, reorderFootnoteTokens } from './lexerSupport'
import { lexBasicBlocks } from './lexerBasicFlowSupport'
import { lexListBlock } from './lexerListFlowSupport'
import { lexTailBlocks } from './lexerTailFlowSupport'

export const lex = (lexer, src) => {
  src = normalizeLexerSource(src)
  lexer.checkFrontmatter = true
  lexer.footnoteOrder = 0
  lexer.token(src, true)
  return reorderFootnoteTokens(lexer.tokens)
}

export const token = (lexer, src, top) => {
  src = src.replace(/^ +$/gm, '')

  while (src) {
    const basicResult = lexBasicBlocks(lexer, src, top)
    src = basicResult.src
    if (basicResult.handled) {
      continue
    }

    const listResult = lexListBlock(lexer, src)
    src = listResult.src
    if (listResult.handled) {
      continue
    }

    const tailResult = lexTailBlocks(lexer, src, top)
    src = tailResult.src
    if (tailResult.handled) {
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }
}
