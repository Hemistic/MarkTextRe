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

export const removeBlocks = (contentState, before, after, isRemoveAfter = true, isRecursion = false) => {
  if (!isRecursion) {
    if (/td|th/.test(before.type)) {
      contentState.exemption.add(contentState.closest(before, 'figure'))
    }
    if (/td|th/.test(after.type)) {
      contentState.exemption.add(contentState.closest(after, 'figure'))
    }
  }

  let nextSibling = contentState.getBlock(before.nextSibling)
  let beforeEnd = false
  while (nextSibling) {
    if (nextSibling.key === after.key || contentState.isInclude(nextSibling, after)) {
      beforeEnd = true
      break
    }
    contentState.removeTextOrBlock(nextSibling)
    nextSibling = contentState.getBlock(nextSibling.nextSibling)
  }
  if (!beforeEnd) {
    const parent = contentState.getParent(before)
    if (parent) {
      contentState.removeBlocks(parent, after, false, true)
    }
  }

  let preSibling = contentState.getBlock(after.preSibling)
  let afterEnd = false
  while (preSibling) {
    if (preSibling.key === before.key || contentState.isInclude(preSibling, before)) {
      afterEnd = true
      break
    }
    contentState.removeTextOrBlock(preSibling)
    preSibling = contentState.getBlock(preSibling.preSibling)
  }
  if (!afterEnd) {
    const parent = contentState.getParent(after)
    if (parent) {
      const removeAfter = isRemoveAfter && contentState.isOnlyRemoveableChild(after)
      contentState.removeBlocks(before, parent, removeAfter, true)
    }
  }

  if (isRemoveAfter) {
    contentState.removeTextOrBlock(after)
  }
  if (!isRecursion) {
    contentState.exemption.clear()
  }
}

export const removeBlock = (contentState, block, fromBlocks = contentState.blocks) => {
  const remove = (blocks, targetBlock) => {
    const len = blocks.length
    for (let i = 0; i < len; i++) {
      if (blocks[i].key === targetBlock.key) {
        const preSibling = contentState.getBlock(targetBlock.preSibling)
        const nextSibling = contentState.getBlock(targetBlock.nextSibling)

        if (preSibling) {
          preSibling.nextSibling = nextSibling ? nextSibling.key : null
        }
        if (nextSibling) {
          nextSibling.preSibling = preSibling ? preSibling.key : null
        }

        return blocks.splice(i, 1)
      } else if (blocks[i].children.length) {
        remove(blocks[i].children, targetBlock)
      }
    }
  }

  remove(Array.isArray(fromBlocks) ? fromBlocks : fromBlocks.children, block)
}

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
