
export const findNextCell = (contentState, block) => {
  if (block.functionType !== 'cellContent') {
    throw new Error('only th and td can have next cell')
  }
  const cellBlock = contentState.getParent(block)
  const nextSibling = contentState.getBlock(cellBlock.nextSibling)
  const rowBlock = contentState.getBlock(cellBlock.parent)
  const tbOrTh = contentState.getBlock(rowBlock.parent)
  if (nextSibling) {
    return contentState.firstInDescendant(nextSibling)
  } else {
    if (rowBlock.nextSibling) {
      const nextRow = contentState.getBlock(rowBlock.nextSibling)
      return contentState.firstInDescendant(nextRow)
    } else if (tbOrTh.type === 'thead') {
      const tBody = contentState.getBlock(tbOrTh.nextSibling)
      if (tBody && tBody.children.length) {
        return contentState.firstInDescendant(tBody)
      }
    }
  }

  return false
}

export const findPreviousCell = (contentState, block) => {
  if (block.functionType !== 'cellContent') {
    throw new Error('only th and td can have previous cell')
  }
  const cellBlock = contentState.getParent(block)
  const previousSibling = contentState.getBlock(cellBlock.preSibling)
  const rowBlock = contentState.getBlock(cellBlock.parent)
  const tbOrTh = contentState.getBlock(rowBlock.parent)
  if (previousSibling) {
    return contentState.firstInDescendant(previousSibling)
  } else {
    if (rowBlock.preSibling) {
      const previousRow = contentState.getBlock(rowBlock.preSibling)
      return contentState.lastInDescendant(previousRow)
    } else if (tbOrTh.type === 'tbody') {
      const tHead = contentState.getBlock(tbOrTh.preSibling)
      if (tHead && tHead.children.length) {
        return contentState.lastInDescendant(tHead)
      }
    }
  }
  return block
}

export const resolveNextTabCell = (contentState, event, start, end, startBlock, endBlock) => {
  let nextCell
  if (start.key === end.key && startBlock.functionType === 'cellContent') {
    nextCell = event.shiftKey
      ? findPreviousCell(contentState, startBlock)
      : findNextCell(contentState, startBlock)
  } else if (endBlock.functionType === 'cellContent') {
    nextCell = endBlock
  }

  return nextCell
}
