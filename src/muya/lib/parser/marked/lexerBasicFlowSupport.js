import {
  createTableToken,
  createSpaceToken,
  createIndentedCodeToken,
  createMultipleMathToken,
  registerFootnote,
  normalizeFootnoteSource,
  createFenceCodeToken,
  createAtxHeadingToken,
  createHrToken,
  normalizeBlockquoteSource,
  createHtmlToken,
  createFrontmatterToken
} from './lexerSupport'

export const lexBasicBlocks = (lexer, src, top) => {
  const {
    footnote,
    frontMatter,
    isGitlabCompatibilityEnabled,
    math
  } = lexer.options
  let cap
  let item

  if (frontMatter) {
    cap = lexer.rules.frontmatter.exec(src)
    if (lexer.checkFrontmatter && top && cap) {
      src = src.substring(cap[0].length)
      lexer.tokens.push(createFrontmatterToken(cap))
    }
    lexer.checkFrontmatter = false
  }

  cap = lexer.rules.newline.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    if (cap[0].length > 1) {
      lexer.tokens.push(createSpaceToken())
    }
  }

  cap = lexer.rules.code.exec(src)
  if (cap) {
    const lastToken = lexer.tokens[lexer.tokens.length - 1]
    src = src.substring(cap[0].length)
    if (lastToken && lastToken.type === 'paragraph') {
      lastToken.text += `\n${cap[0].trimRight()}`
    } else {
      lexer.tokens.push(createIndentedCodeToken(cap[0], lexer.options.pedantic))
    }
    return { handled: true, src }
  }

  if (math) {
    cap = lexer.rules.multiplemath.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lexer.tokens.push(createMultipleMathToken(cap[1]))
      return { handled: true, src }
    }

    if (isGitlabCompatibilityEnabled) {
      cap = lexer.rules.multiplemathGitlab.exec(src)
      if (cap) {
        src = src.substring(cap[0].length)
        lexer.tokens.push(createMultipleMathToken(cap[2] || '', 'gitlab'))
        return { handled: true, src }
      }
    }
  }

  if (footnote) {
    cap = lexer.rules.footnote.exec(src)
    if (top && cap) {
      src = src.substring(cap[0].length)
      const identifier = cap[1]
      registerFootnote(lexer.tokens, identifier, ++lexer.footnoteOrder)
      cap = normalizeFootnoteSource(cap[0])

      lexer.token(cap, top)

      lexer.tokens.push({
        type: 'footnote_end'
      })

      return { handled: true, src }
    }
  }

  cap = lexer.rules.fences.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createFenceCodeToken(cap))
    return { handled: true, src }
  }

  cap = lexer.rules.heading.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createAtxHeadingToken(cap, lexer.options.pedantic))
    return { handled: true, src }
  }

  cap = lexer.rules.nptable.exec(src)
  if (cap) {
    item = createTableToken(cap[1], cap[2], cap[3], false)
    if (item) {
      src = src.substring(cap[0].length)
      lexer.tokens.push(item)
      return { handled: true, src }
    }
  }

  cap = lexer.rules.hr.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createHrToken(cap[0]))
    return { handled: true, src }
  }

  cap = lexer.rules.blockquote.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)

    lexer.tokens.push({
      type: 'blockquote_start'
    })

    cap = normalizeBlockquoteSource(cap[0])
    lexer.token(cap, top)

    lexer.tokens.push({
      type: 'blockquote_end'
    })

    return { handled: true, src }
  }

  cap = lexer.rules.html.exec(src)
  if (cap) {
    src = src.substring(cap[0].length)
    lexer.tokens.push(createHtmlToken(cap, lexer.options))
    return { handled: true, src }
  }

  return { handled: false, src }
}
