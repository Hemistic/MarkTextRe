import {
  createTableToken,
  createSetextHeadingToken,
  createParagraphToken,
  createTextToken,
  consumeDefinition
} from './lexerSupport'

export const lexTailBlocks = (lexer, src, top) => {
  let cap = lexer.rules.def.exec(src)
  let item

  if (top && cap) {
    let text = ''
    do {
      src = src.substring(cap[0].length)
      text += consumeDefinition(lexer.tokens, cap).raw
      if (cap[0].endsWith('\n\n')) break
      cap = lexer.rules.def.exec(src)
    } while (cap)

    if (lexer.options.disableInline) {
      lexer.tokens.push(createParagraphToken(text.replace(/\n*$/, '')))
    }
    return { handled: true, src }
  }

  cap = lexer.rules.table.exec(src)
  if (cap) {
    item = createTableToken(cap[1], cap[2], cap[3], true)
    if (item) {
      src = src.substring(cap[0].length)
      lexer.tokens.push(item)
      return { handled: true, src }
    }
  }

  cap = lexer.rules.lheading.exec(src)
  if (cap) {
    const precededToken = lexer.tokens[lexer.tokens.length - 1]
    src = src.substring(cap[0].length)

    if (precededToken && precededToken.type === 'paragraph') {
      lexer.tokens.pop()
      lexer.tokens.push(createSetextHeadingToken(cap, precededToken))
    } else {
      lexer.tokens.push(createSetextHeadingToken(cap))
    }
    return { handled: true, src }
  }

  cap = lexer.rules.paragraph.exec(src)
  if (top && cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createParagraphToken(cap[1]))
    return { handled: true, src }
  }

  cap = lexer.rules.text.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createTextToken(cap[0]))
    return { handled: true, src }
  }

  return { handled: false, src }
}
