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

export const isUnindentableListItem = (contentState, block) => {
  const parent = contentState.getParent(block)
  const listItem = contentState.getParent(parent)
  const list = contentState.getParent(listItem)
  const listParent = contentState.getParent(list)
  if (!contentState.isCollapse()) return false
  if (listParent && listParent.type === 'li') {
    return !list.preSibling ? 'REPLACEMENT' : 'INDENT'
  }
  return false
}

export const isIndentableListItem = contentState => {
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const parent = contentState.getParent(startBlock)
  if (parent.type !== 'p' || !parent.parent) {
    return false
  }

  const listItem = contentState.getParent(parent)
  if (listItem.type !== 'li' || start.key !== end.key || start.offset !== end.offset) {
    return false
  }

  const list = contentState.getParent(listItem)
  return list && /ol|ul/.test(list.type) && listItem.preSibling
}

export const unindentListItem = (contentState, block, type) => {
  const pBlock = contentState.getParent(block)
  const listItem = contentState.getParent(pBlock)
  const list = contentState.getParent(listItem)
  const listParent = contentState.getParent(list)
  if (type === 'REPLACEMENT') {
    contentState.insertBefore(pBlock, list)
    if (contentState.isOnlyChild(listItem)) {
      contentState.removeBlock(list)
    } else {
      contentState.removeBlock(listItem)
    }
  } else if (type === 'INDENT') {
    if (list.children.length === 1) {
      contentState.removeBlock(list)
    } else {
      const newList = contentState.createBlock(list.type)
      let target = contentState.getNextSibling(listItem)
      while (target) {
        contentState.appendChild(newList, target)
        const temp = target
        target = contentState.getNextSibling(target)
        contentState.removeBlock(temp, list)
      }

      if (newList.children.length) contentState.appendChild(listItem, newList)
      contentState.removeBlock(listItem, list)
      if (!list.children.length) {
        contentState.removeBlock(list)
      }
    }
    contentState.insertAfter(listItem, listParent)
    let target = contentState.getNextSibling(list)
    while (target) {
      contentState.appendChild(listItem, target)
      contentState.removeBlock(target, listParent)
      target = contentState.getNextSibling(target)
    }
  }

  return contentState.partialRender()
}

export const indentListItem = contentState => {
  const { start } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const parent = contentState.getParent(startBlock)
  const listItem = contentState.getParent(parent)
  const list = contentState.getParent(listItem)
  const prevListItem = contentState.getPreSibling(listItem)

  contentState.removeBlock(listItem)

  let newList = contentState.getLastChild(prevListItem)
  if (!newList || !/ol|ul/.test(newList.type)) {
    newList = contentState.createBlock(list.type)
    contentState.appendChild(prevListItem, newList)
  }

  if (newList.children.length !== 0) {
    listItem.isLooseListItem = newList.children[0].isLooseListItem
  }

  contentState.appendChild(newList, listItem)
  return contentState.partialRender()
}

export const insertTab = contentState => {
  const tabSize = contentState.tabSize
  const tabCharacter = String.fromCharCode(160).repeat(tabSize)
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (start.key === end.key && start.offset === end.offset) {
    startBlock.text = startBlock.text.substring(0, start.offset) +
      tabCharacter + endBlock.text.substring(end.offset)
    const key = start.key
    const offset = start.offset + tabCharacter.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    return contentState.partialRender()
  }
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
