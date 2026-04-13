import { createValidateRules } from './tokenizerRuleSupport'
import { consumeBeginTokens } from './tokenizerBeginSupport'
import { consumeLinkToken } from './tokenizerLinkSupport'
import { consumeTailToken } from './tokenizerTailSupport'
import {
  consumeBacklashToken,
  consumeEmphasisToken,
  consumeChunkToken,
  consumeScriptToken,
  consumeFootnoteToken
} from './tokenizerInlineSupport'

export const tokenizerFac = (src, beginRules, inlineRules, validateRules, pos = 0, top, labels, options) => {
  const originSrc = src
  const tokens = []
  const pendingState = {
    value: '',
    start: pos
  }
  const { disableHtml } = options
  const pushPending = () => {
    if (pendingState.value) {
      tokens.push({
        type: 'text',
        raw: pendingState.value,
        content: pendingState.value,
        range: {
          start: pendingState.start,
          end: pos
        }
      })
    }

    pendingState.start = pos
    pendingState.value = ''
  }

  if (beginRules && pos === 0) {
    const beginState = consumeBeginTokens(src, beginRules, tokens, pos)
    src = beginState.src
    pos = beginState.pos
  }

  while (src.length) {
    const backlashState = consumeBacklashToken({
      src,
      pos,
      tokens,
      pushPending,
      inlineRules,
      pendingState
    })
    if (backlashState.consumed) {
      src = backlashState.nextSrc
      pos = backlashState.nextPos
      continue
    }

    const emphasisState = consumeEmphasisToken({
      src,
      pos,
      tokens,
      pushPending,
      inlineRules,
      validateRules,
      labels,
      options,
      tokenizerFac,
      pending: pendingState.value
    })
    if (emphasisState.consumed) {
      src = emphasisState.nextSrc
      pos = emphasisState.nextPos
      continue
    }

    const chunkState = consumeChunkToken({
      src,
      pos,
      tokens,
      pushPending,
      inlineRules,
      validateRules,
      labels,
      options,
      tokenizerFac
    })
    if (chunkState.consumed) {
      src = chunkState.nextSrc
      pos = chunkState.nextPos
      continue
    }

    const scriptState = consumeScriptToken({
      src,
      pos,
      tokens,
      pushPending,
      inlineRules,
      options
    })
    if (scriptState.consumed) {
      src = scriptState.nextSrc
      pos = scriptState.nextPos
      continue
    }

    const footnoteState = consumeFootnoteToken({
      src,
      pos,
      tokens,
      pushPending,
      inlineRules,
      options
    })
    if (footnoteState.consumed) {
      src = footnoteState.nextSrc
      pos = footnoteState.nextPos
      continue
    }

    const linkState = consumeLinkToken({
      src,
      pos,
      labels,
      tokens,
      pushPending,
      inlineRules,
      validateRules,
      options,
      tokenizerFac
    })
    if (linkState.consumed) {
      src = linkState.nextSrc
      pos = linkState.nextPos
      continue
    }

    const tailState = consumeTailToken({
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
    })
    if (tailState.consumed) {
      src = tailState.nextSrc
      pos = tailState.nextPos
      continue
    }

    if (!pendingState.value) pendingState.start = pos
    pendingState.value += src[0]
    src = src.substring(1)
    pos++
  }

  pushPending()
  return tokens
}
