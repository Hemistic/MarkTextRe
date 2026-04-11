import { tokenizer } from '../parser/'
import { conflict } from '../utils'

const INLINE_UPDATE_FRAGMENTS = [
  '(?:^|\n) {0,3}([*+-] {1,4})',
  '(?:^|\n)(\\[[x ]{1}\\] {1,4})',
  '(?:^|\n) {0,3}(\\d{1,9}(?:\\.|\\)) {1,4})',
  '(?:^|\n) {0,3}(#{1,6})(?=\\s{1,}|$)',
  '^(?:[\\s\\S]+?)\\n {0,3}(\\={3,}|\\-{3,})(?= {1,}|$)',
  '(?:^|\n) {0,3}(>).+',
  '^( {4,})',
  '^(\\[\\^[^\\^\\[\\]\\s]+?(?<!\\\\)\\]: )',
  '(?:^|\n) {0,3}((?:\\* *\\* *\\*|- *- *-|_ *_ *_)[ \\*\\-\\_]*)$'
]

const INLINE_UPDATE_REG = new RegExp(INLINE_UPDATE_FRAGMENTS.join('|'), 'i')
const NO_NEED_TOKEN_REG = /text|hard_line_break|soft_line_break/

const hasTokenConflict = (contentState, block, offset) => {
  const { labels } = contentState.stateRender
  for (const token of tokenizer(block.text, {
    labels,
    options: contentState.muya.options
  })) {
    if (NO_NEED_TOKEN_REG.test(token.type)) continue
    const { start, end } = token.range
    const textLen = block.text.length
    if (
      conflict([Math.max(0, start - 1), Math.min(textLen, end + 1)], [offset, offset])
    ) {
      return true
    }
  }

  return false
}

export const checkNeedRender = (contentState, cursor = contentState.cursor) => {
  const { start: cStart, end: cEnd, anchor, focus } = cursor
  const startBlock = contentState.getBlock(cStart ? cStart.key : anchor.key)
  const endBlock = contentState.getBlock(cEnd ? cEnd.key : focus.key)
  const startOffset = cStart ? cStart.offset : anchor.offset
  const endOffset = cEnd ? cEnd.offset : focus.offset

  return hasTokenConflict(contentState, startBlock, startOffset) ||
    hasTokenConflict(contentState, endBlock, endOffset)
}

export const checkInlineUpdate = (contentState, block) => {
  if (/figure/.test(block.type)) {
    return false
  }
  if (/cellContent|codeContent|languageInput|footnoteInput/.test(block.functionType)) {
    return false
  }

  let line = null
  const { text } = block
  if (block.type === 'span') {
    line = block
    block = contentState.getParent(block)
  }
  const listItem = contentState.getParent(block)
  const [
    match, bullet, tasklist, order, atxHeader,
    setextHeader, blockquote, indentCode, footnote, hr
  ] = text.match(INLINE_UPDATE_REG) || []
  const { footnote: isSupportFootnote } = contentState.muya.options

  switch (true) {
    case (!!hr && new Set(hr.split('').filter(item => /\S/.test(item))).size === 1):
      return contentState.updateThematicBreak(block, hr, line)
    case !!bullet:
      return contentState.updateList(block, 'bullet', bullet, line)
    case !!tasklist && listItem && listItem.listItemType === 'bullet':
      return contentState.updateTaskListItem(block, 'tasklist', tasklist)
    case !!order:
      return contentState.updateList(block, 'order', order, line)
    case !!atxHeader:
      return contentState.updateAtxHeader(block, atxHeader, line)
    case !!setextHeader:
      return contentState.updateSetextHeader(block, setextHeader, line)
    case !!blockquote:
      return contentState.updateBlockQuote(block, line)
    case !!indentCode:
      return contentState.updateIndentCode(block, line)
    case !!footnote && block.type === 'p' && !block.parent && isSupportFootnote:
      return contentState.updateFootnote(block, line)
    case !match:
    default:
      return contentState.updateToParagraph(block, line)
  }
}
