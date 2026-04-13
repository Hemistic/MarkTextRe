import { getContentStateOptions } from './runtimeOptionSupport'

const INLINE_UPDATE_FRAGMENTS = [
  '(?:^|\\n) {0,3}([*+-] {1,4})',
  '(?:^|\\n)(\\[[x ]{1}\\] {1,4})',
  '(?:^|\\n) {0,3}(\\d{1,9}(?:\\.|\\)) {1,4})',
  '(?:^|\\n) {0,3}(#{1,6})(?=\\s{1,}|$)',
  '^(?:[\\s\\S]+?)\\n {0,3}(\\={3,}|\\-{3,})(?= {1,}|$)',
  '(?:^|\\n) {0,3}(>).+',
  '^( {4,})',
  '^(\\[\\^[^\\^\\[\\]\\s]+?(?<!\\\\)\\]: )',
  '(?:^|\\n) {0,3}((?:\\* *\\* *\\*|- *- *-|_ *_ *_)[ \\*\\-\\_]*)$'
]

const INLINE_UPDATE_REG = new RegExp(INLINE_UPDATE_FRAGMENTS.join('|'), 'i')

export const applyInlineUpdateRule = (contentState, block) => {
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
  const { footnote: isSupportFootnote } = getContentStateOptions(contentState)

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
