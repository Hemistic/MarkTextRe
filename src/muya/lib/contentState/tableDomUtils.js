export const getTableElement = tableId => document.querySelector(`#${tableId}`)

export const calculateAspects = (tableId, barType) => {
  const table = getTableElement(tableId)
  if (barType === 'bottom') {
    const firstRow = table.querySelector('tr')
    return Array.from(firstRow.children).map(cell => cell.clientWidth)
  }
  return Array.from(table.querySelectorAll('tr')).map(row => row.clientHeight)
}

export const getAllTableCells = tableId => {
  const table = getTableElement(tableId)
  const rows = table.querySelectorAll('tr')
  const cells = []
  for (const row of Array.from(rows)) {
    cells.push(Array.from(row.children))
  }

  return cells
}

export const getIndex = (barType, cell) => {
  if (cell.tagName === 'SPAN') {
    cell = cell.parentNode
  }
  const row = cell.parentNode
  if (barType === 'bottom') {
    return Array.from(row.children).indexOf(cell)
  }

  const rowContainer = row.parentNode
  if (rowContainer.tagName === 'THEAD') {
    return 0
  }
  return Array.from(rowContainer.children).indexOf(row) + 1
}

export const getDragCells = (tableId, barType, index) => {
  const table = getTableElement(tableId)
  const dragCells = []
  if (barType === 'left') {
    if (index === 0) {
      dragCells.push(...table.querySelectorAll('th'))
    } else {
      const row = table.querySelector('tbody').children[index - 1]
      dragCells.push(...row.children)
    }
  } else {
    const rows = Array.from(table.querySelectorAll('tr'))
    for (const row of rows) {
      dragCells.push(row.children[index])
    }
  }
  return dragCells
}
