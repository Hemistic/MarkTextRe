export const syncLooseListItems = list => {
  const isLooseListItem = list.children.some(child => child.isLooseListItem)
  list.children.forEach(child => {
    child.isLooseListItem = isLooseListItem
  })
}

export const mergeOrCreateList = (contentState, block, newListItemBlock, wrapperTag, markerOrDelimiter, cleanMarker) => {
  const preSibling = contentState.getPreSibling(block)
  const nextSibling = contentState.getNextSibling(block)

  if (
    preSibling &&
    contentState.checkSameMarkerOrDelimiter(preSibling, markerOrDelimiter) &&
    nextSibling &&
    contentState.checkSameMarkerOrDelimiter(nextSibling, markerOrDelimiter)
  ) {
    contentState.appendChild(preSibling, newListItemBlock)
    const partChildren = nextSibling.children.splice(0)
    partChildren.forEach(child => contentState.appendChild(preSibling, child))
    contentState.removeBlock(nextSibling)
    contentState.removeBlock(block)
    syncLooseListItems(preSibling)
    return
  }

  if (
    preSibling &&
    contentState.checkSameMarkerOrDelimiter(preSibling, markerOrDelimiter)
  ) {
    contentState.appendChild(preSibling, newListItemBlock)
    contentState.removeBlock(block)
    syncLooseListItems(preSibling)
    return
  }

  if (
    nextSibling &&
    contentState.checkSameMarkerOrDelimiter(nextSibling, markerOrDelimiter)
  ) {
    contentState.insertBefore(newListItemBlock, nextSibling.children[0])
    contentState.removeBlock(block)
    syncLooseListItems(nextSibling)
    return
  }

  const listBlock = contentState.createBlock(wrapperTag, {
    listType: wrapperTag === 'ol' ? 'order' : 'bullet'
  })

  if (wrapperTag === 'ol') {
    const start = cleanMarker ? cleanMarker.slice(0, -1) : 1
    listBlock.start = /^\d+$/.test(start) ? start : 1
  }

  contentState.appendChild(listBlock, newListItemBlock)
  contentState.insertBefore(listBlock, block)
  contentState.removeBlock(block)
}
