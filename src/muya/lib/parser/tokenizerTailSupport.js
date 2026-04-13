import { getAttributes } from './htmlSupport'
import { matchHtmlTag } from './tokenizerRuleSupport'

const disallowedHtmlTag = /(?:title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)/i

const createRange = (pos, raw) => ({
  start: pos,
  end: pos + raw.length
})

export const consumeTailToken = ({
  src,
  pos,
  top,
  originSrc,
  disableHtml,
  labels,
  tokens,
  pushPending,
  inlineRules,
  validateRules,
  options,
  tokenizerFac
}) => {
  const htmlEscapeTo = inlineRules.html_escape.exec(src)
  if (htmlEscapeTo) {
    const raw = htmlEscapeTo[0]
    pushPending()
    tokens.push({
      type: 'html_escape',
      raw,
      escapeCharacter: htmlEscapeTo[1],
      parent: tokens,
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  }

  const autoLinkExtTo = inlineRules.auto_link_extension.exec(src)
  if (autoLinkExtTo && top && (pos === 0 || /[* _~(]{1}/.test(originSrc[pos - 1]))) {
    pushPending()
    tokens.push({
      type: 'auto_link_extension',
      raw: autoLinkExtTo[0],
      www: autoLinkExtTo[1],
      url: autoLinkExtTo[2],
      email: autoLinkExtTo[3],
      linkType: autoLinkExtTo[1] ? 'www' : (autoLinkExtTo[2] ? 'url' : 'email'),
      parent: tokens,
      range: createRange(pos, autoLinkExtTo[0])
    })
    return {
      consumed: true,
      nextSrc: src.substring(autoLinkExtTo[0].length),
      nextPos: pos + autoLinkExtTo[0].length
    }
  }

  const autoLTo = inlineRules.auto_link.exec(src)
  if (autoLTo) {
    pushPending()
    tokens.push({
      type: 'auto_link',
      raw: autoLTo[0],
      href: autoLTo[1],
      email: autoLTo[2],
      isLink: !!autoLTo[1],
      marker: '<',
      parent: tokens,
      range: createRange(pos, autoLTo[0])
    })
    return {
      consumed: true,
      nextSrc: src.substring(autoLTo[0].length),
      nextPos: pos + autoLTo[0].length
    }
  }

  const htmlTo = matchHtmlTag(src, disableHtml, inlineRules)
  let attrs
  if (htmlTo && htmlTo[1] && !htmlTo[3]) {
    const raw = htmlTo[0]
    pushPending()
    tokens.push({
      type: 'html_tag',
      raw,
      tag: '<!---->',
      openTag: htmlTo[1],
      parent: tokens,
      attrs: {},
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  } else if (htmlTo && !(disallowedHtmlTag.test(htmlTo[3])) && (attrs = getAttributes(htmlTo[0]))) {
    const raw = htmlTo[0]
    pushPending()
    tokens.push({
      type: 'html_tag',
      raw,
      tag: htmlTo[3],
      openTag: htmlTo[2],
      closeTag: htmlTo[5],
      parent: tokens,
      attrs,
      content: htmlTo[4],
      children: htmlTo[4]
        ? tokenizerFac(htmlTo[4], undefined, inlineRules, validateRules, pos + htmlTo[2].length, false, labels, options)
        : '',
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  }

  const softTo = inlineRules.soft_line_break.exec(src)
  if (softTo) {
    const raw = softTo[0]
    pushPending()
    tokens.push({
      type: 'soft_line_break',
      raw,
      lineBreak: softTo[1],
      isAtEnd: softTo.input.length === raw.length,
      parent: tokens,
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  }

  const hardTo = inlineRules.hard_line_break.exec(src)
  if (hardTo) {
    const raw = hardTo[0]
    pushPending()
    tokens.push({
      type: 'hard_line_break',
      raw,
      spaces: hardTo[1],
      lineBreak: hardTo[2],
      isAtEnd: hardTo.input.length === raw.length,
      parent: tokens,
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  }

  const tailTo = inlineRules.tail_header.exec(src)
  if (tailTo && top) {
    const raw = tailTo[1]
    pushPending()
    tokens.push({
      type: 'tail_header',
      raw,
      marker: raw,
      parent: tokens,
      range: createRange(pos, raw)
    })
    return {
      consumed: true,
      nextSrc: src.substring(raw.length),
      nextPos: pos + raw.length
    }
  }

  return {
    consumed: false,
    nextSrc: src,
    nextPos: pos
  }
}
