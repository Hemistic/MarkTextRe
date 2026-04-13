
export const insertAfter = (contentState, newBlock, oldBlock) => {
  const siblings = oldBlock.parent ? contentState.getBlock(oldBlock.parent).children : contentState.blocks
  const oldNextSibling = contentState.getBlock(oldBlock.nextSibling)
  const index = contentState.findIndex(siblings, oldBlock)
  siblings.splice(index + 1, 0, newBlock)
  oldBlock.nextSibling = newBlock.key
  newBlock.parent = oldBlock.parent
  newBlock.preSibling = oldBlock.key
  if (oldNextSibling) {
    newBlock.nextSibling = oldNextSibling.key
    oldNextSibling.preSibling = newBlock.key
  }
}

export const insertBefore = (contentState, newBlock, oldBlock) => {
  const siblings = oldBlock.parent ? contentState.getBlock(oldBlock.parent).children : contentState.blocks
  const oldPreSibling = contentState.getBlock(oldBlock.preSibling)
  const index = contentState.findIndex(siblings, oldBlock)
  siblings.splice(index, 0, newBlock)
  oldBlock.preSibling = newBlock.key
  newBlock.parent = oldBlock.parent
  newBlock.nextSibling = oldBlock.key
  newBlock.preSibling = null

  if (oldPreSibling) {
    oldPreSibling.nextSibling = newBlock.key
    newBlock.preSibling = oldPreSibling.key
  }
}

export const prependChild = (parent, block) => {
  block.parent = parent.key
  block.preSibling = null
  if (parent.children.length) {
    block.nextSibling = parent.children[0].key
  }
  parent.children.unshift(block)
}

export const appendChild = (parent, block) => {
  const len = parent.children.length
  const lastChild = parent.children[len - 1]
  parent.children.push(block)
  block.parent = parent.key
  if (lastChild) {
    lastChild.nextSibling = block.key
    block.preSibling = lastChild.key
  } else {
    block.preSibling = null
  }
  block.nextSibling = null
}

export const replaceBlock = (contentState, newBlock, oldBlock) => {
  const blockList = oldBlock.parent ? contentState.getParent(oldBlock).children : contentState.blocks
  const index = contentState.findIndex(blockList, oldBlock)

  blockList.splice(index, 1, newBlock)
  newBlock.parent = oldBlock.parent
  newBlock.preSibling = oldBlock.preSibling
  newBlock.nextSibling = oldBlock.nextSibling
}
