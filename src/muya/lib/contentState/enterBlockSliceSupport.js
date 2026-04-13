export const chopBlockByCursor = (contentState, block, key, offset) => {
  const newBlock = contentState.createBlock('p')
  const { children } = block
  const index = children.findIndex(child => child.key === key)
  const activeLine = contentState.getBlock(key)
  const { text } = activeLine

  newBlock.children = children.splice(index + 1)
  newBlock.children.forEach(child => {
    child.parent = newBlock.key
  })
  children[index].nextSibling = null

  if (newBlock.children.length) {
    newBlock.children[0].preSibling = null
  }

  if (offset === 0) {
    contentState.removeBlock(activeLine, children)
    contentState.prependChild(newBlock, activeLine)
  } else if (offset < text.length) {
    activeLine.text = text.substring(0, offset)
    const newLine = contentState.createBlock('span', { text: text.substring(offset) })
    contentState.prependChild(newBlock, newLine)
  }

  return newBlock
}

export const chopBlock = (contentState, block) => {
  const parent = contentState.getParent(block)
  const type = parent.type
  const container = contentState.createBlock(type)
  const index = contentState.findIndex(parent.children, block)
  const partChildren = parent.children.splice(index + 1)

  block.nextSibling = null
  partChildren.forEach(child => {
    contentState.appendChild(container, child)
  })
  contentState.insertAfter(container, parent)

  return container
}
