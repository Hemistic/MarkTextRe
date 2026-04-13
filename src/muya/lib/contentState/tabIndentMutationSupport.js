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
