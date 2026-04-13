import { dispatchStateAndRender, setCursor } from './tableEditContextSupport'

export const resizeTable = (contentState, table, row, column) => {
  const { row: oldRow, column: oldColumn } = table
  let tBody = table.children[1]
  const tHead = table.children[0]
  const headerRow = tHead.children[0]
  const bodyRows = tBody ? tBody.children : []

  if (column > oldColumn) {
    for (let i = oldColumn + 1; i <= column; i++) {
      const th = contentState.createBlock('th', {
        column: i,
        align: ''
      })
      const thContent = contentState.createBlock('span', {
        functionType: 'cellContent'
      })
      contentState.appendChild(th, thContent)
      contentState.appendChild(headerRow, th)
      bodyRows.forEach(bodyRow => {
        const td = contentState.createBlock('td', {
          column: i,
          align: ''
        })
        const tdContent = contentState.createBlock('span', {
          functionType: 'cellContent'
        })
        contentState.appendChild(td, tdContent)
        contentState.appendChild(bodyRow, td)
      })
    }
  } else if (column < oldColumn) {
    const rows = [headerRow, ...bodyRows]
    rows.forEach(tableRow => {
      while (tableRow.children.length > column + 1) {
        const lastChild = tableRow.children[tableRow.children.length - 1]
        contentState.removeBlock(lastChild)
      }
    })
  }

  if (row < oldRow) {
    while (tBody && tBody.children.length > row) {
      const lastRow = tBody.children[tBody.children.length - 1]
      contentState.removeBlock(lastRow)
    }
    if (tBody && tBody.children.length === 0) {
      contentState.removeBlock(tBody)
      tBody = null
    }
  } else if (row > oldRow) {
    if (!tBody) {
      tBody = contentState.createBlock('tbody')
      contentState.appendChild(table, tBody)
    }
    const oneHeaderRow = tHead.children[0]
    for (let i = oldRow + 1; i <= row; i++) {
      const bodyRow = contentState.createRow(oneHeaderRow, false)
      contentState.appendChild(tBody, bodyRow)
    }
  }

  Object.assign(table, { row, column })
  const cursorBlock = contentState.firstInDescendant(headerRow)
  setCursor(contentState, cursorBlock, cursorBlock.text.length)
  dispatchStateAndRender(contentState)
}
