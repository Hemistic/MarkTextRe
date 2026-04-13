
import selection from '../selection'
import { findNearestParagraph, findOutMostParagraph } from '../selection/dom'

export const checkBackspaceCase = contentState => {
  const node = selection.getSelectionStart()
  const paragraph = findNearestParagraph(node)
  const outMostParagraph = findOutMostParagraph(node)
  let block = contentState.getBlock(paragraph.id)
  if (block.type === 'span' && block.preSibling) {
    return false
  }
  if (block.type === 'span') {
    block = contentState.getParent(block)
  }
  const preBlock = contentState.getPreSibling(block)
  const outBlock = contentState.findOutMostBlock(block)
  const parent = contentState.getParent(block)

  const { left: outLeft } = selection.getCaretOffsets(outMostParagraph)
  const { left: inLeft } = selection.getCaretOffsets(paragraph)

  if (
    (parent && parent.type === 'li' && inLeft === 0 && contentState.isFirstChild(block)) ||
    (parent && parent.type === 'li' && inLeft === 0 && parent.listItemType === 'task' && preBlock.type === 'input')
  ) {
    if (contentState.isOnlyChild(parent)) {
      return { type: 'LI', info: 'REPLACEMENT' }
    } else if (contentState.isFirstChild(parent)) {
      return { type: 'LI', info: 'REMOVE_INSERT_BEFORE' }
    } else {
      return { type: 'LI', info: 'INSERT_PRE_LIST_ITEM' }
    }
  }
  if (parent && parent.type === 'blockquote' && inLeft === 0) {
    if (contentState.isOnlyChild(block)) {
      return { type: 'BLOCKQUOTE', info: 'REPLACEMENT' }
    } else if (contentState.isFirstChild(block)) {
      return { type: 'BLOCKQUOTE', info: 'INSERT_BEFORE' }
    }
  }
  if (!outBlock.preSibling && outLeft === 0) {
    return { type: 'STOP' }
  }
}
