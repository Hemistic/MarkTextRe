import { normal, breaks, gfm, pedantic } from './inlineRules'
import { escape, findClosingBracket, getUniqueId, rtrim } from './utils'

export const selectInlineRules = options => {
  if (options.pedantic) {
    return pedantic
  } else if (options.gfm) {
    return options.breaks ? breaks : gfm
  }

  return normal
}

export const createHighPriorityRules = rules => {
  const highPriorityEmpRules = {}
  const highPriorityLinkRules = {}

  for (const key of Object.keys(rules)) {
    if (/^(?:autolink|link|code|tag)$/.test(key) && rules[key] instanceof RegExp) {
      highPriorityEmpRules[key] = rules[key]
    }
    if (/^(?:autolink|code|tag)$/.test(key) && rules[key] instanceof RegExp) {
      highPriorityLinkRules[key] = rules[key]
    }
  }

  return {
    highPriorityEmpRules,
    highPriorityLinkRules
  }
}

export const updateTagState = (lexer, raw) => {
  if (!lexer.inLink && /^<a /i.test(raw)) {
    lexer.inLink = true
  } else if (lexer.inLink && /^<\/a>/i.test(raw)) {
    lexer.inLink = false
  }

  if (!lexer.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(raw)) {
    lexer.inRawBlock = true
  } else if (lexer.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(raw)) {
    lexer.inRawBlock = false
  }
}

export const renderFootnoteIdentifier = (lexer, identifier) => {
  const footnoteInfo = lexer.footnotes[identifier] || {}
  if (footnoteInfo.footnoteIdentifierId === undefined) {
    footnoteInfo.footnoteIdentifierId = getUniqueId()
  }

  return lexer.renderer.footnoteIdentifier(identifier, footnoteInfo)
}

export const normalizeLinkCapture = (cap, options) => {
  const trimmedUrl = cap[2].trim()

  if (!options.pedantic && trimmedUrl.startsWith('<')) {
    if (!trimmedUrl.endsWith('>')) {
      return null
    }

    const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\')
    if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
      return null
    }
  } else {
    const lastParenIndex = findClosingBracket(cap[2], '()')
    if (lastParenIndex > -1) {
      const start = cap[0].indexOf('!') === 0 ? 5 : 4
      const linkLen = start + cap[1].length + lastParenIndex
      cap[2] = cap[2].substring(0, lastParenIndex)
      cap[0] = cap[0].substring(0, linkLen).trim()
      cap[3] = ''
    }
  }

  let href = cap[2]
  let title = ''
  if (options.pedantic) {
    const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href)
    if (link) {
      href = link[1]
      title = link[3]
    }
  } else {
    title = cap[3] ? cap[3].slice(1, -1) : ''
  }

  href = href.trim()
  if (href.startsWith('<')) {
    if (options.pedantic && !trimmedUrl.endsWith('>')) {
      href = href.slice(1)
    } else {
      href = href.slice(1, -1)
    }
  }

  return {
    href,
    title
  }
}

export const normalizeCodeSpanText = text => {
  let normalized = text.replace(/\n/g, ' ')
  const hasNonSpaceChars = /[^ ]/.test(normalized)
  const hasSpaceCharsOnBothEnds = normalized.startsWith(' ') && normalized.endsWith(' ')
  if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
    normalized = normalized.substring(1, normalized.length - 1)
  }

  return escape(normalized, true)
}

export const resolveAutoLink = (lexer, cap) => {
  if (cap[2] === '@') {
    const text = escape(lexer.mangle(cap[1]))
    return {
      text,
      href: 'mailto:' + text
    }
  }

  const text = escape(cap[1])
  return {
    text,
    href: text
  }
}

export const resolveUrlLink = (lexer, cap) => {
  if (cap[2] === '@') {
    const text = escape(cap[0])
    return {
      cap,
      text,
      href: 'mailto:' + text
    }
  }

  let previous = ''
  do {
    previous = cap[0]
    cap[0] = lexer.rules._backpedal.exec(cap[0])[0]
  } while (previous !== cap[0])

  const text = escape(cap[0])
  return {
    cap,
    text,
    href: cap[1] === 'www.' ? 'http://' + text : text
  }
}

export const renderInlineText = (lexer, text) => {
  if (lexer.inRawBlock) {
    return lexer.renderer.text(
      lexer.options.sanitize
        ? (lexer.options.sanitizer ? lexer.options.sanitizer(text) : escape(text))
        : text
    )
  }

  return lexer.renderer.text(escape(smartypants(text, lexer.options)))
}

export const escapes = (text, rules) => {
  return text ? text.replace(rules._escapes, '$1') : text
}

export const outputLink = (lexer, cap, link) => {
  const href = link.href
  const title = link.title ? escape(link.title) : null
  const text = cap[1].replace(/\\([\[\]])/g, '$1')

  return cap[0].charAt(0) !== '!'
    ? lexer.renderer.link(href, title, lexer.output(text))
    : lexer.renderer.image(href, title, escape(text))
}

export const smartypants = (text, options) => {
  /* eslint-disable no-useless-escape */
  if (!options.smartypants) return text
  return text
    .replace(/---/g, '\u2014')
    .replace(/--/g, '\u2013')
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    .replace(/'/g, '\u2019')
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    .replace(/"/g, '\u201d')
    .replace(/\.{3}/g, '\u2026')
  /* eslint-ensable no-useless-escape */
}

export const mangle = (text, options) => {
  if (!options.mangle) return text
  const l = text.length
  let out = ''
  let ch

  for (let i = 0; i < l; i++) {
    ch = text.charCodeAt(i)
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16)
    }
    out += '&#' + ch + ';'
  }

  return out
}
