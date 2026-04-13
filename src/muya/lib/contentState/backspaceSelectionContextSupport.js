
import selection from '../selection'
import { findNearestParagraph } from '../selection/dom'

export const getBackspaceContext = contentState => {
  const node = selection.getSelectionStart()
  const parentNode = node && node.nodeType === 1 ? node.parentNode : null
  const paragraph = findNearestParagraph(node)
  if (!paragraph) {
    return {
      node,
      parentNode,
      paragraph: null,
      block: null,
      parent: null,
      preBlock: null,
      left: 0,
      right: 0,
      inlineDegrade: false
    }
  }
  const id = paragraph.id
  const block = contentState.getBlock(id)
  if (!block) {
    return {
      node,
      parentNode,
      paragraph,
      block: null,
      parent: null,
      preBlock: null,
      left: 0,
      right: 0,
      inlineDegrade: false
    }
  }
  const parent = contentState.getBlock(block.parent)
  const preBlock = contentState.findPreBlockInLocation(block)
  const { left, right } = selection.getCaretOffsets(paragraph)
  const inlineDegrade = contentState.checkBackspaceCase()

  return {
    node,
    parentNode,
    paragraph,
    block,
    parent,
    preBlock,
    left,
    right,
    inlineDegrade
  }
}
