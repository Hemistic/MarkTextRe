
import { HAS_TEXT_BLOCK_REG } from '../config'

export const firstInDescendant = (contentState, block) => {
  const children = block.children
  if (block.children.length === 0 && HAS_TEXT_BLOCK_REG.test(block.type)) {
    return block
  } else if (children.length) {
    if (
      children[0].type === 'input' ||
      (children[0].type === 'div' && children[0].editable === false)
    ) {
      return contentState.firstInDescendant(children[1])
    } else {
      return contentState.firstInDescendant(children[0])
    }
  }
}

export const lastInDescendant = (contentState, block) => {
  if (block.children.length === 0 && HAS_TEXT_BLOCK_REG.test(block.type)) {
    return block
  } else if (block.children.length) {
    const children = block.children
    let lastChild = children[children.length - 1]
    while (lastChild.editable === false) {
      lastChild = contentState.getPreSibling(lastChild)
    }
    return contentState.lastInDescendant(lastChild)
  }
}

export const findPreBlockInLocation = (contentState, block) => {
  const parent = contentState.getParent(block)
  const preBlock = contentState.getPreSibling(block)
  if (
    block.preSibling &&
    preBlock.type !== 'input' &&
    preBlock.type !== 'div' &&
    preBlock.editable !== false
  ) {
    return contentState.lastInDescendant(preBlock)
  } else if (parent) {
    return contentState.findPreBlockInLocation(parent)
  } else {
    return null
  }
}

export const findNextBlockInLocation = (contentState, block) => {
  const parent = contentState.getParent(block)
  const nextBlock = contentState.getNextSibling(block)

  if (nextBlock && nextBlock.editable !== false) {
    return contentState.firstInDescendant(nextBlock)
  } else if (parent) {
    return contentState.findNextBlockInLocation(parent)
  } else {
    return null
  }
}

export const getFirstBlock = contentState => {
  return contentState.firstInDescendant(contentState.blocks[0])
}

export const getLastBlock = contentState => {
  const { blocks } = contentState
  return contentState.lastInDescendant(blocks[blocks.length - 1])
}
