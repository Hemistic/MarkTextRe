export const getFirstBlockInNextRow = (contentState, row) => {
  let nextSibling = contentState.getBlock(row.nextSibling)
  if (!nextSibling) {
    const rowContainer = contentState.getBlock(row.parent)
    const table = contentState.getBlock(rowContainer.parent)
    const figure = contentState.getBlock(table.parent)

    if (rowContainer.type === 'thead' && table.children[1]) {
      nextSibling = table.children[1]
    } else if (figure.nextSibling) {
      nextSibling = contentState.getBlock(figure.nextSibling)
    } else {
      nextSibling = contentState.createBlockP()
      contentState.insertAfter(nextSibling, figure)
    }
  }

  return contentState.firstInDescendant(nextSibling)
}

export const getParagraphBlock = block => {
  if (block.type === 'li') {
    return block.listItemType === 'task' ? block.children[1] : block.children[0]
  } else {
    return block
  }
}
