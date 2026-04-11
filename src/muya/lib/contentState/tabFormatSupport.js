import { HAS_TEXT_BLOCK_REG } from '../config'
import { tokenizer } from '../parser'

const BOTH_SIDES_FORMATS = ['strong', 'em', 'inline_code', 'image', 'link', 'reference_image', 'reference_link', 'emoji', 'del', 'html_tag', 'inline_math']

export const checkCursorAtEndFormat = (contentState, text, offset) => {
  const { labels } = contentState.stateRender
  const tokens = tokenizer(text, {
    hasBeginRules: false,
    labels,
    options: contentState.muya.options
  })
  let result = null
  const walkTokens = tkns => {
    for (const token of tkns) {
      const { marker, type, range, children, srcAndTitle, hrefAndTitle, backlash, closeTag, isFullLink, label } = token
      const { start, end } = range
      if (BOTH_SIDES_FORMATS.includes(type) && offset > start && offset < end) {
        switch (type) {
          case 'strong':
          case 'em':
          case 'inline_code':
          case 'emoji':
          case 'del':
          case 'inline_math':
            if (marker && offset === end - marker.length) {
              result = { offset: marker.length }
              return
            }
            break
          case 'image':
          case 'link': {
            const linkTitleLen = (srcAndTitle || hrefAndTitle).length
            const secondLashLen = backlash && backlash.second ? backlash.second.length : 0
            if (offset === end - 3 - (linkTitleLen + secondLashLen)) {
              result = { offset: 2 }
              return
            } else if (offset === end - 1) {
              result = { offset: 1 }
              return
            }
            break
          }
          case 'reference_image':
          case 'reference_link': {
            const labelLen = label ? label.length : 0
            const secondLashLen = backlash && backlash.second ? backlash.second.length : 0
            if (isFullLink) {
              if (offset === end - 3 - labelLen - secondLashLen) {
                result = { offset: 2 }
                return
              } else if (offset === end - 1) {
                result = { offset: 1 }
                return
              }
            } else if (offset === end - 1) {
              result = { offset: 1 }
              return
            }
            break
          }
          case 'html_tag':
            if (closeTag && offset === end - closeTag.length) {
              result = { offset: closeTag.length }
              return
            }
            break
        }
      }
      if (children && children.length) {
        walkTokens(children)
      }
    }
  }
  walkTokens(tokens)

  return result
}

export const tryJumpOutOfFormat = (contentState, start, end, startBlock) => {
  if (
    start.key === end.key &&
    start.offset === end.offset &&
    HAS_TEXT_BLOCK_REG.test(startBlock.type) &&
    startBlock.functionType !== 'codeContent' &&
    startBlock.functionType !== 'languageInput'
  ) {
    const { text, key } = startBlock
    const { offset } = start
    const atEnd = checkCursorAtEndFormat(contentState, text, offset)
    if (atEnd) {
      contentState.cursor = {
        start: { key, offset: offset + atEnd.offset },
        end: { key, offset: offset + atEnd.offset }
      }
      contentState.partialRender()
      return true
    }
  }

  return false
}
