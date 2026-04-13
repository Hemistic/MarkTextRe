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
