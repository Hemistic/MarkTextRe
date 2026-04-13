
import { queryContentState } from './runtimeDomSupport'

export const prepareEnterBlock = (contentState, block, start) => {
  let parent = contentState.getParent(block)

  if (block.type === 'span') {
    block = parent
    parent = contentState.getParent(block)
  }

  if (
    (parent && parent.type === 'li' && contentState.isOnlyChild(block)) ||
    (parent && parent.type === 'li' && parent.listItemType === 'task' && parent.children.length === 2)
  ) {
    block = parent
    parent = contentState.getParent(block)
  }

  const paragraph = queryContentState(contentState, `#${block.key}`)
  const text = contentState.getBlock(start.key).text
  const left = start.offset
  const right = text.length - left

  return {
    block,
    paragraph,
    parent,
    text,
    left,
    right,
    type: block.type
  }
}
