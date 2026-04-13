
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
