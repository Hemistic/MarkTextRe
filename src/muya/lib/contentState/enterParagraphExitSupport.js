import { chopBlock } from './enterBlockSliceSupport'
import { createBlockLi, createTaskItemBlock } from './enterListItemSupport'

export const enterInEmptyParagraph = (contentState, block) => {
  if (block.type === 'span') block = contentState.getParent(block)
  const parent = contentState.getParent(block)
  let newBlock = null

  if (parent && (/ul|ol|blockquote/.test(parent.type))) {
    newBlock = contentState.createBlockP()
    if (contentState.isOnlyChild(block)) {
      contentState.insertAfter(newBlock, parent)
      contentState.removeBlock(parent)
    } else if (contentState.isFirstChild(block)) {
      contentState.insertBefore(newBlock, parent)
    } else if (contentState.isLastChild(block)) {
      contentState.insertAfter(newBlock, parent)
    } else {
      chopBlock(contentState, block)
      contentState.insertAfter(newBlock, parent)
    }

    contentState.removeBlock(block)
  } else if (parent && parent.type === 'li') {
    if (parent.listItemType === 'task') {
      const { checked } = parent.children[0]
      newBlock = createTaskItemBlock(contentState, null, checked)
    } else {
      newBlock = createBlockLi(contentState)
      newBlock.listItemType = parent.listItemType
      newBlock.bulletMarkerOrDelimiter = parent.bulletMarkerOrDelimiter
    }
    newBlock.isLooseListItem = parent.isLooseListItem
    contentState.insertAfter(newBlock, parent)
    const index = contentState.findIndex(parent.children, block)
    const blocksInListItem = parent.children.splice(index + 1)
    blocksInListItem.forEach(child => contentState.appendChild(newBlock, child))
    contentState.removeBlock(block)

    newBlock = newBlock.listItemType === 'task'
      ? newBlock.children[1]
      : newBlock.children[0]
  } else {
    newBlock = contentState.createBlockP()
    if (block.type === 'li') {
      contentState.insertAfter(newBlock, parent)
      contentState.removeBlock(block)
    } else {
      contentState.insertAfter(newBlock, block)
    }
  }

  const { key } = newBlock.children[0]
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  return contentState.partialRender()
}
