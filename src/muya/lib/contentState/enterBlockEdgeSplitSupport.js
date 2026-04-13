export const splitBlockEdge = (contentState, context, block, left, right, type) => {
  let newBlock

  if (left === 0 && right === 0) {
    contentState.enterInEmptyParagraph(block)
    return null
  }

  if (left !== 0 && right === 0) {
    if (type === 'li') {
      if (block.listItemType === 'task') {
        newBlock = contentState.createTaskItemBlock(null, false)
      } else {
        newBlock = contentState.createBlockLi()
        newBlock.listItemType = block.listItemType
        newBlock.bulletMarkerOrDelimiter = block.bulletMarkerOrDelimiter
      }
      newBlock.isLooseListItem = block.isLooseListItem
    } else {
      newBlock = contentState.createBlockP()
    }

    if (block.type === 'p') {
      const lastLine = block.children[block.children.length - 1]
      if (lastLine.text === '') {
        contentState.removeBlock(lastLine)
      }
    }
    contentState.insertAfter(newBlock, block)
    return newBlock
  }

  if (left === 0 && right !== 0) {
    if (type === 'li') {
      if (block.listItemType === 'task') {
        newBlock = contentState.createTaskItemBlock(null, false)
      } else {
        newBlock = contentState.createBlockLi()
        newBlock.listItemType = block.listItemType
        newBlock.bulletMarkerOrDelimiter = block.bulletMarkerOrDelimiter
      }
      newBlock.isLooseListItem = block.isLooseListItem
    } else {
      newBlock = contentState.createBlockP()
    }

    contentState.insertBefore(newBlock, block)
    return block
  }

  newBlock = contentState.createBlockP()
  contentState.insertAfter(newBlock, block)
  return newBlock
}
