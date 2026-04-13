export const findNextRowCell = (contentState, cell) => {
  if (cell.functionType !== 'cellContent') {
    throw new Error(`block with type ${cell && cell.type} is not a table cell`)
  }
  const thOrTd = contentState.getParent(cell)
  const row = contentState.closest(cell, 'tr')
  const rowContainer = contentState.closest(row, /thead|tbody/)
  const column = row.children.indexOf(thOrTd)
  if (rowContainer.type === 'thead') {
    const tbody = contentState.getNextSibling(rowContainer)
    if (tbody && tbody.children.length) {
      return tbody.children[0].children[column].children[0]
    }
  } else if (rowContainer.type === 'tbody') {
    const nextRow = contentState.getNextSibling(row)
    if (nextRow) {
      return nextRow.children[column].children[0]
    }
  }
  return null
}

export const findPrevRowCell = (contentState, cell) => {
  if (cell.functionType !== 'cellContent') {
    throw new Error(`block with type ${cell && cell.type} is not a table cell`)
  }
  const thOrTd = contentState.getParent(cell)
  const row = contentState.closest(cell, 'tr')
  const rowContainer = contentState.getParent(row)
  const rowIndex = rowContainer.children.indexOf(row)
  const column = row.children.indexOf(thOrTd)
  if (rowContainer.type === 'tbody') {
    if (rowIndex === 0 && rowContainer.preSibling) {
      const thead = contentState.getPreSibling(rowContainer)
      return thead.children[0].children[column].children[0]
    } else if (rowIndex > 0) {
      return contentState.getPreSibling(row).children[column].children[0]
    }
  }
  return null
}
