import { isLengthEven } from '../utils'

export const consumeBeginTokens = (src, beginRules, tokens, pos) => {
  let nextSrc = src
  let nextPos = pos
  const beginRuleList = ['header', 'hr', 'code_fense', 'multiple_math']

  for (const ruleName of beginRuleList) {
    const to = beginRules[ruleName].exec(nextSrc)

    if (to) {
      const raw = to[0]
      tokens.push({
        type: ruleName,
        raw,
        parent: tokens,
        marker: to[1],
        content: to[2] || '',
        backlash: to[3] || '',
        range: {
          start: nextPos,
          end: nextPos + raw.length
        }
      })
      nextSrc = nextSrc.substring(raw.length)
      nextPos += raw.length
      break
    }
  }

  const def = beginRules.reference_definition.exec(nextSrc)
  if (def && isLengthEven(def[3])) {
    tokens.push({
      type: 'reference_definition',
      parent: tokens,
      leftBracket: def[1],
      label: def[2],
      backlash: def[3] || '',
      rightBracket: def[4],
      leftHrefMarker: def[5] || '',
      href: def[6],
      rightHrefMarker: def[7] || '',
      leftTitlespace: def[8],
      titleMarker: def[9] || '',
      title: def[10] || '',
      rightTitleSpace: def[11] || '',
      raw: def[0],
      range: {
        start: nextPos,
        end: nextPos + def[0].length
      }
    })
    nextSrc = nextSrc.substring(def[0].length)
    nextPos += def[0].length
  }

  return {
    src: nextSrc,
    pos: nextPos
  }
}
