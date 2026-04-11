import { HAS_TEXT_BLOCK_REG } from '../config'

export const getBlock = (contentState, key) => {
  if (!key) return null
  let result = null
  const travel = blocks => {
    for (const block of blocks) {
      if (block.key === key) {
        result = block
        return
      }
      if (block.children.length) {
        travel(block.children)
      }
    }
  }
  travel(contentState.blocks)
  return result
}

export const getParent = (contentState, block) => {
  if (block && block.parent) {
    return contentState.getBlock(block.parent)
  }
  return null
}

export const getParents = (contentState, block) => {
  const result = [block]
  let parent = contentState.getParent(block)
  while (parent) {
    result.push(parent)
    parent = contentState.getParent(parent)
  }
  return result
}

export const getPreSibling = (contentState, block) => {
  return block.preSibling ? contentState.getBlock(block.preSibling) : null
}

export const getNextSibling = (contentState, block) => {
  return block.nextSibling ? contentState.getBlock(block.nextSibling) : null
}

export const isInclude = (contentState, parent, target) => {
  const children = parent.children
  if (children.length === 0) {
    return false
  }

  if (children.some(child => child.key === target.key)) {
    return true
  }

  return children.some(child => contentState.isInclude(child, target))
}

export const getActiveBlocks = contentState => {
  const result = []
  let block = contentState.getBlock(contentState.cursor.start.key)
  if (block) {
    result.push(block)
  }
  while (block && block.parent) {
    block = contentState.getBlock(block.parent)
    result.push(block)
  }
  return result
}

export const findOutMostBlock = (contentState, block) => {
  const parent = contentState.getBlock(block.parent)
  return parent ? contentState.findOutMostBlock(parent) : block
}

export const findIndex = (children, block) => {
  return children.findIndex(child => child === block)
}

export const canInserFrontMatter = (contentState, block) => {
  if (!block) return true
  const parent = contentState.getParent(block)
  return block.type === 'span' &&
    !block.preSibling &&
    !parent.preSibling &&
    !parent.parent
}

export const isFirstChild = block => !block.preSibling

export const isLastChild = block => !block.nextSibling

export const isOnlyChild = block => !block.nextSibling && !block.preSibling

export const isOnlyRemoveableChild = (contentState, block) => {
  if (block.editable === false) return false
  const parent = contentState.getParent(block)
  return (parent ? parent.children : contentState.blocks)
    .filter(child => child.editable && child.functionType !== 'languageInput').length === 1
}

export const getLastChild = block => {
  if (block) {
    const len = block.children.length
    if (len) {
      return block.children[len - 1]
    }
  }
  return null
}

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

export const closest = (contentState, block, type) => {
  if (!block) {
    return null
  }
  if (type instanceof RegExp ? type.test(block.type) : block.type === type) {
    return block
  }
  const parent = contentState.getParent(block)
  return contentState.closest(parent, type)
}

export const getAnchor = (contentState, block) => {
  const { type, functionType } = block
  if (type !== 'span') {
    return null
  }

  if (functionType === 'codeContent' || functionType === 'cellContent') {
    return contentState.closest(block, 'figure') || contentState.closest(block, 'pre')
  }
  return contentState.getParent(block)
}
