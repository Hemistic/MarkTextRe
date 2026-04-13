import { escape } from './utils'
import { validateEmphasize, lowerPriority } from '../emphasisSupport'
import {
  renderFootnoteIdentifier,
  updateTagState,
  normalizeLinkCapture,
  normalizeCodeSpanText,
  resolveAutoLink,
  resolveUrlLink,
  renderInlineText
} from './inlineLexerSupport'

export const output = (lexer, src) => {
  const { disableInline, emoji, math, superSubScript, footnote } = lexer.options
  if (disableInline) {
    return escape(src)
  }

  let out = ''
  let text
  let href
  let cap
  let lastChar = ''

  while (src) {
    cap = lexer.rules.escape.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += escape(cap[1])
      continue
    }

    if (footnote) {
      cap = lexer.rules.footnoteIdentifier.exec(src)
      if (cap) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        out += renderFootnoteIdentifier(lexer, cap[1])
      }
    }

    cap = lexer.rules.tag.exec(src)
    if (cap) {
      updateTagState(lexer, cap[0])
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += lexer.renderer.html(lexer.options.sanitize
        ? (lexer.options.sanitizer
          ? lexer.options.sanitizer(cap[0])
          : escape(cap[0]))
        : cap[0])
      continue
    }

    cap = lexer.rules.link.exec(src)
    if (cap && lowerPriority(src, cap[0].length, lexer.highPriorityLinkRules)) {
      const linkInfo = normalizeLinkCapture(cap, lexer.options)
      if (!linkInfo) return

      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)

      lexer.inLink = true
      out += lexer.outputLink(cap, {
        href: lexer.escapes(linkInfo.href),
        title: lexer.escapes(linkInfo.title)
      })
      lexer.inLink = false
      continue
    }

    cap = lexer.rules.reflink.exec(src) || lexer.rules.nolink.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      let link = (cap[2] || cap[1]).replace(/\s+/g, ' ')
      link = lexer.links[link.toLowerCase()]
      if (!link || !link.href) {
        out += cap[0].charAt(0)
        src = cap[0].substring(1) + src
        continue
      }
      lexer.inLink = true
      out += lexer.outputLink(cap, link)
      lexer.inLink = false
      continue
    }

    if (math) {
      cap = lexer.rules.math.exec(src)
      if (cap) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        text = cap[1]
        out += lexer.renderer.inlineMath(text)
      }
    }

    if (emoji) {
      cap = lexer.rules.emoji.exec(src)
      if (cap) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        text = cap[0]
        out += lexer.renderer.emoji(text, cap[2])
      }
    }

    if (superSubScript) {
      cap = lexer.rules.superscript.exec(src) || lexer.rules.subscript.exec(src)
      if (cap) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        const content = cap[2]
        const marker = cap[1]
        out += lexer.renderer.script(content, marker)
      }
    }

    cap = lexer.rules.strong.exec(src)
    if (cap) {
      const marker = cap[0].match(/^(?:_{1,2}|\*{1,2})/)[0]
      const isValid = validateEmphasize(src, cap[0].length, marker, lastChar, lexer.highPriorityEmpRules)
      if (isValid) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        out += lexer.renderer.strong(lexer.output(cap[4] || cap[3] || cap[2] || cap[1]))
        continue
      }
    }

    cap = lexer.rules.em.exec(src)
    if (cap) {
      const marker = cap[0].match(/^(?:_{1,2}|\*{1,2})/)[0]
      const isValid = validateEmphasize(src, cap[0].length, marker, lastChar, lexer.highPriorityEmpRules)
      if (isValid) {
        src = src.substring(cap[0].length)
        lastChar = cap[0].charAt(cap[0].length - 1)
        out += lexer.renderer.em(lexer.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]))
        continue
      }
    }

    cap = lexer.rules.code.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      text = normalizeCodeSpanText(cap[2])
      out += lexer.renderer.codespan(text)
      continue
    }

    cap = lexer.rules.br.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += lexer.renderer.br()
      continue
    }

    cap = lexer.rules.del.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += lexer.renderer.del(lexer.output(cap[2]))
      continue
    }

    cap = lexer.rules.autolink.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      ;({ text, href } = resolveAutoLink(lexer, cap))
      out += lexer.renderer.link(href, null, text)
      continue
    }

    cap = lexer.rules.url.exec(src)
    if (!lexer.inLink && cap) {
      ;({ cap, text, href } = resolveUrlLink(lexer, cap))
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += lexer.renderer.link(href, null, text)
      continue
    }

    cap = lexer.rules.text.exec(src)
    if (cap) {
      src = src.substring(cap[0].length)
      lastChar = cap[0].charAt(cap[0].length - 1)
      out += renderInlineText(lexer, cap[0])
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }

  return out
}
