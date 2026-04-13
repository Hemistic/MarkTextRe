export const normalizeExistingList = (
  contentState,
  listBlock,
  listType,
  blockType,
  orderListDelimiter,
  bulletListMarker
) => {
  if (listType === listBlock.listType) {
    const listItems = listBlock.children
    listItems.forEach(listItem => {
      listItem.children.forEach(itemParagraph => {
        if (itemParagraph.type !== 'input') {
          contentState.insertBefore(itemParagraph, listBlock)
        }
      })
    })
    contentState.removeBlock(listBlock)
    return true
  }

  if (listBlock.listType === 'task') {
    const listItems = listBlock.children
    listItems.forEach(item => {
      const inputBlock = item.children[0]
      inputBlock && contentState.removeBlock(inputBlock)
    })
  }

  const oldListType = listBlock.listType
  listBlock.type = blockType
  listBlock.listType = listType
  listBlock.children.forEach(block => (block.listItemType = listType))

  if (listType === 'order') {
    listBlock.start = listBlock.start || 1
    listBlock.children.forEach(block => (block.bulletMarkerOrDelimiter = orderListDelimiter))
  }
  if (
    (listType === 'bullet' && oldListType === 'order') ||
    (listType === 'task' && oldListType === 'order')
  ) {
    delete listBlock.start
    listBlock.children.forEach(block => (block.bulletMarkerOrDelimiter = bulletListMarker))
  }

  if (listType === 'task') {
    const listItems = listBlock.children
    listItems.forEach(item => {
      const checkbox = contentState.createBlock('input')
      checkbox.checked = false
      contentState.insertBefore(checkbox, item.children[0])
    })
  }

  return true
}

export const wrapBlocksInList = (contentState, listType, blocks, startIndex, endIndex, preferLooseListItem) => {
  const referBlock = blocks[endIndex]
  const listWrapper = contentState.createBlock(listType === 'order' ? 'ol' : 'ul')
  listWrapper.listType = listType
  if (listType === 'order') listWrapper.start = 1

  blocks.slice(startIndex, endIndex + 1).forEach(child => {
    if (child !== referBlock) {
      contentState.removeBlock(child, blocks)
    } else {
      contentState.insertAfter(listWrapper, child)
      contentState.removeBlock(child, blocks)
    }
    const listItem = contentState.createBlock('li')
    listItem.listItemType = listType
    listItem.isLooseListItem = preferLooseListItem
    contentState.appendChild(listWrapper, listItem)
    if (listType === 'task') {
      const checkbox = contentState.createBlock('input')
      checkbox.checked = false
      contentState.appendChild(listItem, checkbox)
    }
    contentState.appendChild(listItem, child)
  })

  return true
}
