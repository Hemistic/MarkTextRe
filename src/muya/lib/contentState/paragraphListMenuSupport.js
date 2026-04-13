import { selectionChange, getCommonParent } from './paragraphSelectionSupport'
import {
  normalizeExistingList,
  wrapBlocksInList
} from './paragraphListTransformSupport'
import { getContentStateOptions } from './runtimeOptionSupport'
import { dispatchContentStateSelectionAndChange } from './runtimeEventSupport'

export const handleListMenu = (contentState, paraType, insertMode) => {
  const { start, end, affiliation } = selectionChange(contentState, contentState.cursor)
  const { orderListDelimiter, bulletListMarker, preferLooseListItem } = getContentStateOptions(contentState)
  const [blockType, listType] = paraType.split('-')
  const isListed = affiliation.slice(0, 3).filter(block => /ul|ol/.test(block.type))

  if (isListed.length && !insertMode) {
    return normalizeExistingList(
      contentState,
      isListed[0],
      listType,
      blockType,
      orderListDelimiter,
      bulletListMarker
    )
  }

  if (start.key === end.key || (start.block.parent && start.block.parent === end.block.parent)) {
    const block = contentState.getBlock(start.key)
    const paragraph = contentState.getBlock(block.parent)
    if (listType === 'task') {
      const listItemParagraph = contentState.updateList(paragraph, 'bullet', undefined, block)
      setTimeout(() => {
        contentState.updateTaskListItem(listItemParagraph, listType)
        contentState.partialRender()
        dispatchContentStateSelectionAndChange(contentState)
      })
      return false
    }

    contentState.updateList(paragraph, listType, undefined, block)
    return true
  }

  const { parent, startIndex, endIndex } = getCommonParent(contentState)
  const children = parent ? parent.children : contentState.blocks
  return wrapBlocksInList(contentState, listType, children, startIndex, endIndex, preferLooseListItem)
}

export const handleLooseListItem = contentState => {
  const { affiliation } = selectionChange(contentState, contentState.cursor)
  let listContainer = []
  if (affiliation.length >= 1 && /ul|ol/.test(affiliation[0].type)) {
    listContainer = affiliation[0].children
  } else if (affiliation.length >= 3 && affiliation[1].type === 'li') {
    listContainer = affiliation[2].children
  }
  if (listContainer.length > 0) {
    for (const block of listContainer) {
      block.isLooseListItem = !block.isLooseListItem
    }
    contentState.partialRender()
  }
}
