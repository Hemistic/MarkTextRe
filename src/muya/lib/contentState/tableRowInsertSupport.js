export const insertRow = (contentState, context, location) => {
  const { cellBlock, currentRow, tbody, columnIndex } = context
  if (!tbody) {
    return null
  }

  const newRow = (location === 'previous' && cellBlock.type === 'th')
    ? contentState.createRow(currentRow, true)
    : contentState.createRow(currentRow, false)

  if (location === 'previous') {
    contentState.insertBefore(newRow, currentRow)
    if (cellBlock.type === 'th') {
      contentState.removeBlock(currentRow)
      currentRow.children.forEach(cell => (cell.type = 'td'))
      const firstRow = tbody.children[0]
      contentState.insertBefore(currentRow, firstRow)
    }
  } else if (cellBlock.type === 'th') {
    const firstRow = tbody.children[0]
    contentState.insertBefore(newRow, firstRow)
  } else {
    contentState.insertAfter(newRow, currentRow)
  }

  return newRow.children[columnIndex].children[0]
}
