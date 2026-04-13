
import { hasCursorEdgeKey } from './cursorStateSupport'

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

export const getActiveBlocks = (contentState, activeBlock = null) => {
  const result = []
  const cursorStart = contentState && contentState.cursor ? contentState.cursor.start : null
  let block = activeBlock || (hasCursorEdgeKey(cursorStart) ? contentState.getBlock(cursorStart.key) : null)
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
  if (!block) {
    return null
  }

  const parent = contentState.getBlock(block.parent)
  return parent ? contentState.findOutMostBlock(parent) : block
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
  if (!block) {
    return null
  }

  const { type, functionType } = block
  if (type !== 'span') {
    return null
  }

  if (functionType === 'codeContent' || functionType === 'cellContent') {
    return contentState.closest(block, 'figure') || contentState.closest(block, 'pre')
  }
  return contentState.getParent(block)
}
