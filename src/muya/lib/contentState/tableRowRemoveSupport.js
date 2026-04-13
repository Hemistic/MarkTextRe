export const removeRow = (contentState, context, location) => {
  const { cellBlock, currentRow, thead, tbody, columnIndex } = context
  let cursorBlock

  if (location === 'previous') {
    if (cellBlock.type === 'th') return cursorBlock
    if (!currentRow.preSibling) {
      const headRow = thead.children[0]
      if (!currentRow.nextSibling) return cursorBlock
      contentState.removeBlock(headRow)
      contentState.removeBlock(currentRow)
      currentRow.children.forEach(cell => (cell.type = 'th'))
      contentState.appendChild(thead, currentRow)
    } else {
      const preRow = contentState.getPreSibling(currentRow)
      contentState.removeBlock(preRow)
    }
    return cursorBlock
  }

  if (location === 'current') {
    if (cellBlock.type === 'th' && tbody && tbody.children.length >= 2) {
      const firstRow = tbody.children[0]
      contentState.removeBlock(currentRow)
      contentState.removeBlock(firstRow)
      contentState.appendChild(thead, firstRow)
      firstRow.children.forEach(cell => (cell.type = 'th'))
      cursorBlock = firstRow.children[columnIndex].children[0]
    }
    if (cellBlock.type === 'td' && (currentRow.preSibling || currentRow.nextSibling)) {
      cursorBlock = (contentState.getNextSibling(currentRow) || contentState.getPreSibling(currentRow)).children[columnIndex].children[0]
      contentState.removeBlock(currentRow)
    }
    return cursorBlock
  }

  if (cellBlock.type === 'th') {
    if (tbody && tbody.children.length >= 2) {
      const firstRow = tbody.children[0]
      contentState.removeBlock(firstRow)
    }
  } else {
    const nextRow = contentState.getNextSibling(currentRow)
    if (nextRow) {
      contentState.removeBlock(nextRow)
    }
  }

  return cursorBlock
}
