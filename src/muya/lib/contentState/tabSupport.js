export {
  findNextCell,
  findPreviousCell,
  isUnindentableListItem,
  isIndentableListItem,
  unindentListItem,
  indentListItem,
  insertTab,
  resolveNextTabCell
} from './tabListSupport'
export {
  checkCursorAtEndFormat,
  tryJumpOutOfFormat
} from './tabFormatSupport'
export {
  tryAutocompleteHtmlTag
} from './tabHtmlSupport'
import selection from '../selection'
import { resolveNextTabCell, findNextCell, findPreviousCell, isUnindentableListItem, isIndentableListItem, unindentListItem, indentListItem, insertTab } from './tabListSupport'
import { checkCursorAtEndFormat, tryJumpOutOfFormat } from './tabFormatSupport'
import { tryAutocompleteHtmlTag } from './tabHtmlSupport'

export const tabHandler = (contentState, event) => {
  // disable tab focus
  event.preventDefault()

  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)

  if (event.shiftKey && startBlock.functionType !== 'cellContent') {
    const unindentType = isUnindentableListItem(contentState, startBlock)
    if (unindentType) {
      unindentListItem(contentState, startBlock, unindentType)
    }
    return
  }

  if (tryJumpOutOfFormat(contentState, start, end, startBlock)) {
    return
  }

  if (tryAutocompleteHtmlTag(contentState, start, end, startBlock)) {
    return
  }

  const nextCell = resolveNextTabCell(contentState, event, start, end, startBlock, endBlock)
  if (nextCell) {
    const { key } = nextCell
    const offset = 0

    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }

    const figure = contentState.closest(nextCell, 'figure')
    return contentState.singleRender(figure)
  }

  if (isIndentableListItem(contentState)) {
    return indentListItem(contentState)
  }

  return insertTab(contentState)
}
