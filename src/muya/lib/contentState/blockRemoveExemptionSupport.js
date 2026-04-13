export const removeTextOrBlock = (contentState, block) => {
  if (block.functionType === 'languageInput') return

  const checkerIn = currentBlock => {
    if (contentState.exemption.has(currentBlock.key)) {
      return true
    }
    const parent = contentState.getBlock(currentBlock.parent)
    return parent ? checkerIn(parent) : false
  }

  const checkerOut = currentBlock => {
    const children = currentBlock.children
    if (children.length) {
      if (children.some(child => contentState.exemption.has(child.key))) {
        return true
      }
      return children.some(child => checkerOut(child))
    }
    return false
  }

  if (checkerIn(block) || checkerOut(block)) {
    block.text = ''
    if (block.children.length) {
      block.children.forEach(child => contentState.removeTextOrBlock(child))
    }
  } else if (block.editable) {
    contentState.removeBlock(block)
  }
}
