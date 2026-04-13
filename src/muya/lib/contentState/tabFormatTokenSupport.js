const BOTH_SIDES_FORMATS = ['strong', 'em', 'inline_code', 'image', 'link', 'reference_image', 'reference_link', 'emoji', 'del', 'html_tag', 'inline_math']

const getFormatJumpOffset = (token, offset) => {
  const { marker, type, range, srcAndTitle, hrefAndTitle, backlash, closeTag, isFullLink, label } = token
  const { start, end } = range
  if (!BOTH_SIDES_FORMATS.includes(type) || offset <= start || offset >= end) {
    return null
  }

  switch (type) {
    case 'strong':
    case 'em':
    case 'inline_code':
    case 'emoji':
    case 'del':
    case 'inline_math':
      return marker && offset === end - marker.length
        ? { offset: marker.length }
        : null
    case 'image':
    case 'link': {
      const linkTitleLen = (srcAndTitle || hrefAndTitle).length
      const secondLashLen = backlash && backlash.second ? backlash.second.length : 0
      if (offset === end - 3 - (linkTitleLen + secondLashLen)) {
        return { offset: 2 }
      }
      return offset === end - 1 ? { offset: 1 } : null
    }
    case 'reference_image':
    case 'reference_link': {
      const labelLen = label ? label.length : 0
      const secondLashLen = backlash && backlash.second ? backlash.second.length : 0
      if (isFullLink) {
        if (offset === end - 3 - labelLen - secondLashLen) {
          return { offset: 2 }
        }
        return offset === end - 1 ? { offset: 1 } : null
      }
      return offset === end - 1 ? { offset: 1 } : null
    }
    case 'html_tag':
      return closeTag && offset === end - closeTag.length
        ? { offset: closeTag.length }
        : null
    default:
      return null
  }
}

export const findCursorAtEndFormat = (tokens, offset) => {
  let result = null
  const walkTokens = tkns => {
    for (const token of tkns) {
      result = getFormatJumpOffset(token, offset)
      if (result) {
        return
      }

      const { children } = token
      if (children && children.length) {
        walkTokens(children)
        if (result) {
          return
        }
      }
    }
  }
  walkTokens(tokens)
  return result
}
