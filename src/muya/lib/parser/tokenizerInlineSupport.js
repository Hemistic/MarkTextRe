import { isLengthEven } from '../utils'
import { validateEmphasize, lowerPriority } from './emphasisSupport'

const createRange = (pos, raw) => ({
  start: pos,
  end: pos + raw.length
})

export const consumeBacklashToken = ({ src, pos, tokens, pushPending, inlineRules, pendingState }) => {
  const backTo = inlineRules.backlash.exec(src)
  if (!backTo) {
    return { consumed: false, nextSrc: src, nextPos: pos }
  }

  pushPending()
  tokens.push({
    type: 'backlash',
    raw: backTo[1],
    marker: backTo[1],
    parent: tokens,
    content: '',
    range: createRange(pos, backTo[1])
  })
  pendingState.value += pendingState.value + backTo[2]
  pendingState.start = pos + backTo[1].length

  return {
    consumed: true,
    nextSrc: src.substring(backTo[0].length),
    nextPos: pos + backTo[0].length
  }
}

export const consumeEmphasisToken = ({
  src,
  pos,
  tokens,
  pushPending,
  inlineRules,
  validateRules,
  labels,
  options,
  tokenizerFac,
  pending
}) => {
  for (const rule of ['strong', 'em']) {
    const to = inlineRules[rule].exec(src)
    if (!to || !isLengthEven(to[3])) continue

    if (!validateEmphasize(src, to[0].length, to[1], pending, validateRules)) {
      return { consumed: false, nextSrc: src, nextPos: pos }
    }

    pushPending()
    tokens.push({
      type: rule,
      raw: to[0],
      range: createRange(pos, to[0]),
      marker: to[1],
      parent: tokens,
      children: tokenizerFac(to[2], undefined, inlineRules, validateRules, pos + to[1].length, false, labels, options),
      backlash: to[3]
    })

    return {
      consumed: true,
      nextSrc: src.substring(to[0].length),
      nextPos: pos + to[0].length
    }
  }

  return { consumed: false, nextSrc: src, nextPos: pos }
}

export const consumeChunkToken = ({
  src,
  pos,
  tokens,
  pushPending,
  inlineRules,
  validateRules,
  labels,
  options,
  tokenizerFac
}) => {
  for (const rule of ['inline_code', 'del', 'emoji', 'inline_math']) {
    const to = inlineRules[rule].exec(src)
    if (!to || !isLengthEven(to[3])) continue

    if (rule === 'emoji' && !lowerPriority(src, to[0].length, validateRules)) {
      return { consumed: false, nextSrc: src, nextPos: pos }
    }

    pushPending()
    if (rule === 'inline_code' || rule === 'emoji' || rule === 'inline_math') {
      tokens.push({
        type: rule,
        raw: to[0],
        range: createRange(pos, to[0]),
        marker: to[1],
        parent: tokens,
        content: to[2],
        backlash: to[3]
      })
    } else {
      tokens.push({
        type: rule,
        raw: to[0],
        range: createRange(pos, to[0]),
        marker: to[1],
        parent: tokens,
        children: tokenizerFac(to[2], undefined, inlineRules, validateRules, pos + to[1].length, false, labels, options),
        backlash: to[3]
      })
    }

    return {
      consumed: true,
      nextSrc: src.substring(to[0].length),
      nextPos: pos + to[0].length
    }
  }

  return { consumed: false, nextSrc: src, nextPos: pos }
}

export const consumeScriptToken = ({ src, pos, tokens, pushPending, inlineRules, options }) => {
  if (!options.superSubScript) {
    return { consumed: false, nextSrc: src, nextPos: pos }
  }

  const superSubTo = inlineRules.superscript.exec(src) || inlineRules.subscript.exec(src)
  if (!superSubTo) {
    return { consumed: false, nextSrc: src, nextPos: pos }
  }

  pushPending()
  tokens.push({
    type: 'super_sub_script',
    raw: superSubTo[0],
    marker: superSubTo[1],
    range: createRange(pos, superSubTo[0]),
    parent: tokens,
    content: superSubTo[2]
  })

  return {
    consumed: true,
    nextSrc: src.substring(superSubTo[0].length),
    nextPos: pos + superSubTo[0].length
  }
}

export const consumeFootnoteToken = ({ src, pos, tokens, pushPending, inlineRules, options }) => {
  if (pos === 0 || !options.footnote) {
    return { consumed: false, nextSrc: src, nextPos: pos }
  }

  const footnoteTo = inlineRules.footnote_identifier.exec(src)
  if (!footnoteTo) {
    return { consumed: false, nextSrc: src, nextPos: pos }
  }

  pushPending()
  tokens.push({
    type: 'footnote_identifier',
    raw: footnoteTo[0],
    marker: footnoteTo[1],
    range: createRange(pos, footnoteTo[0]),
    parent: tokens,
    content: footnoteTo[2]
  })

  return {
    consumed: true,
    nextSrc: src.substring(footnoteTo[0].length),
    nextPos: pos + footnoteTo[0].length
  }
}
