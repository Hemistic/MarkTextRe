import { getParagraphReference } from '../utils'

const setCursor = (contentState, block, offset = 0) => {
  const { key } = block
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

const dispatchStateAndRender = contentState => {
  contentState.muya.eventCenter.dispatch('stateChange')
  contentState.partialRender()
}

const updateTableSize = table => {
  const thead = table.children[0]
  const tbody = table.children[1]
  const column = thead.children[0].children.length - 1
  const row = thead.children.length + (tbody ? tbody.children.length : 0) - 1
  Object.assign(table, { row, column })
}

const getCellContext = (contentState, cellContentKey) => {
  let block
  let start
  let end

  if (cellContentKey) {
    block = contentState.getBlock(cellContentKey)
  } else {
    ({ start, end } = contentState.cursor)
    if (start.key !== end.key) {
      throw new Error('Cursor is not in one block, can not editTable')
    }
    block = contentState.getBlock(start.key)
  }

  if (block.functionType !== 'cellContent') {
    throw new Error('Cursor is not in table block, so you can not insert/edit row/column')
  }

  const cellBlock = contentState.getParent(block)
  const currentRow = contentState.getParent(cellBlock)
  const table = contentState.closest(block, 'table')

  return {
    block,
    start,
    end,
    cellBlock,
    currentRow,
    table,
    thead: table.children[0],
    tbody: table.children[1],
    columnIndex: currentRow.children.indexOf(cellBlock)
  }
}

const deleteTable = (contentState, figure) => {
  const newLine = contentState.createBlock('span')
  figure.children = []
  contentState.appendChild(figure, newLine)
  figure.type = 'p'
  figure.text = ''
  setCursor(contentState, newLine)
  dispatchStateAndRender(contentState)
}

const alignTableColumn = (contentState, table, column, align, type) => {
  const newAlign = align === type ? '' : type
  table.children.forEach(rowContainer => {
    rowContainer.children.forEach(row => {
      row.children[column].align = newAlign
    })
  })
  dispatchStateAndRender(contentState)
}

const resizeTable = (contentState, table, row, column) => {
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

const handleTablePicker = (contentState, table, figureKey) => {
  const { eventCenter } = contentState.muya
  const tableEle = document.querySelector(`#${figureKey} [data-label=table]`)
  const { row = 1, column = 1 } = table
  const handler = (nextRow, nextColumn) => resizeTable(contentState, table, nextRow, nextColumn)
  const reference = getParagraphReference(tableEle, tableEle.id)

  eventCenter.dispatch('muya-table-picker', { row, column }, reference, handler)
}

const insertRow = (contentState, context, location) => {
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

const removeRow = (contentState, context, location) => {
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

const insertColumn = (contentState, context, location) => {
  const { cellBlock, thead, tbody, columnIndex } = context

  ;[...thead.children, ...tbody.children].forEach(tableRow => {
    const targetCell = tableRow.children[columnIndex]
    const cell = contentState.createBlock(targetCell.type, {
      align: ''
    })
    const cellContent = contentState.createBlock('span', {
      functionType: 'cellContent'
    })
    contentState.appendChild(cell, cellContent)
    if (location === 'left') {
      contentState.insertBefore(cell, targetCell)
    } else {
      contentState.insertAfter(cell, targetCell)
    }
    tableRow.children.forEach((tableCell, index) => {
      tableCell.column = index
    })
  })

  return location === 'left'
    ? contentState.getPreSibling(cellBlock).children[0]
    : contentState.getNextSibling(cellBlock).children[0]
}

const removeColumn = (contentState, context, location) => {
  const { block, cellBlock, currentRow, thead, tbody, columnIndex } = context
  let cursorBlock

  if (currentRow.children.length <= 2) return cursorBlock

  ;[...thead.children, ...tbody.children].forEach(tableRow => {
    const targetCell = tableRow.children[columnIndex]
    const removeCell = location === 'left'
      ? contentState.getPreSibling(targetCell)
      : (location === 'current' ? targetCell : contentState.getNextSibling(targetCell))
    if (removeCell === cellBlock) {
      cursorBlock = contentState.findNextBlockInLocation(block)
    }

    if (removeCell) {
      contentState.removeBlock(removeCell)
    }
    tableRow.children.forEach((tableCell, index) => {
      tableCell.column = index
    })
  })

  return cursorBlock
}

export const tableToolBarClick = (contentState, type) => {
  const { start: { key } } = contentState.cursor
  const block = contentState.getBlock(key)
  const parentBlock = contentState.getParent(block)

  if (block.functionType !== 'cellContent') {
    throw new Error('table is not active')
  }

  const { column, align } = parentBlock
  const table = contentState.closest(block, 'table')
  const figure = contentState.getBlock(table.parent)

  switch (type) {
    case 'left':
    case 'center':
    case 'right':
      alignTableColumn(contentState, table, column, align, type)
      break
    case 'delete':
      deleteTable(contentState, figure)
      break
    case 'table':
      handleTablePicker(contentState, table, figure.key)
      break
  }
}

export const editTable = (contentState, { location, action, target }, cellContentKey) => {
  const context = getCellContext(contentState, cellContentKey)
  const { table, tbody, start, end } = context
  let cursorBlock

  if (target === 'row') {
    cursorBlock = action === 'insert'
      ? insertRow(contentState, context, location)
      : removeRow(contentState, context, location)
  } else if (target === 'column') {
    cursorBlock = action === 'insert'
      ? insertColumn(contentState, context, location)
      : removeColumn(contentState, context, location)
  }

  updateTableSize(table)

  if (cursorBlock) {
    setCursor(contentState, cursorBlock)
  } else {
    contentState.cursor = { start, end }
  }

  if (tbody && !tbody.children.length) {
    contentState.removeBlock(tbody)
  }

  contentState.partialRender()
  contentState.muya.eventCenter.dispatch('stateChange')
}
