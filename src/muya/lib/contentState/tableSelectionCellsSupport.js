export const calculateSelectedCells = contentState => {
  const { anchor, focus, cells } = contentState.cellSelectInfo
  contentState.cellSelectInfo.selectedCells = []
  if (focus) {
    const startRowIndex = Math.min(anchor.row, focus.row)
    const endRowIndex = Math.max(anchor.row, focus.row)
    const startColIndex = Math.min(anchor.column, focus.column)
    const endColIndex = Math.max(anchor.column, focus.column)
    for (let i = startRowIndex; i <= endRowIndex; i++) {
      const row = cells[i]
      for (let j = startColIndex; j <= endColIndex; j++) {
        const cell = row[j]
        const cellBlock = contentState.getBlock(cell.id)
        contentState.cellSelectInfo.selectedCells.push({
          ele: cell,
          key: cell.id,
          text: cellBlock.children[0].text,
          align: cellBlock.align,
          top: i === startRowIndex,
          right: j === endColIndex,
          bottom: i === endRowIndex,
          left: j === startColIndex
        })
      }
    }
  }
}

export const setSelectedCellsStyle = contentState => {
  const { selectedCells, cells } = contentState.cellSelectInfo
  for (const row of cells) {
    for (const cell of row) {
      cell.classList.remove('ag-cell-selected')
      cell.classList.remove('ag-cell-border-top')
      cell.classList.remove('ag-cell-border-right')
      cell.classList.remove('ag-cell-border-bottom')
      cell.classList.remove('ag-cell-border-left')
    }
  }

  for (const cell of selectedCells) {
    const { ele, top, right, bottom, left } = cell
    ele.classList.add('ag-cell-selected')
    if (top) ele.classList.add('ag-cell-border-top')
    if (right) ele.classList.add('ag-cell-border-right')
    if (bottom) ele.classList.add('ag-cell-border-bottom')
    if (left) ele.classList.add('ag-cell-border-left')
  }
}
