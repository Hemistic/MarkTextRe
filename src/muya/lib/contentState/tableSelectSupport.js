import { getAllTableCells, getIndex } from './tableDomUtils'

export const handleCellMouseDown = (contentState, event) => {
  if (event.buttons === 2) {
    return
  }
  const { eventCenter } = contentState.muya
  const { target } = event
  const cell = target.closest('th') || target.closest('td')
  const tableId = target.closest('table').id
  const row = getIndex('left', cell)
  const column = getIndex('bottom', cell)
  contentState.cellSelectInfo = {
    tableId,
    anchor: {
      key: cell.id,
      row,
      column
    },
    focus: null,
    isStartSelect: false,
    cells: getAllTableCells(tableId),
    selectedCells: []
  }

  const mouseMoveId = eventCenter.attachDOMEvent(document.body, 'mousemove', contentState.handleCellMouseMove.bind(contentState))
  const mouseUpId = eventCenter.attachDOMEvent(document.body, 'mouseup', contentState.handleCellMouseUp.bind(contentState))
  contentState.cellSelectEventIds.push(mouseMoveId, mouseUpId)
}

export const handleCellMouseMove = (contentState, event) => {
  const { target } = event
  const cell = target.closest('th') || target.closest('td')
  const table = target.closest('table')
  const isOverSameTableCell = cell && table && table.id === contentState.cellSelectInfo.tableId
  if (isOverSameTableCell && cell.id !== contentState.cellSelectInfo.anchor.key) {
    contentState.cellSelectInfo.isStartSelect = true
    contentState.muya.blur(true)
  }
  if (isOverSameTableCell && contentState.cellSelectInfo.isStartSelect) {
    const row = getIndex('left', cell)
    const column = getIndex('bottom', cell)
    contentState.cellSelectInfo.focus = {
      key: cell.key,
      row,
      column
    }
  } else {
    contentState.cellSelectInfo.focus = null
  }

  calculateSelectedCells(contentState)
  setSelectedCellsStyle(contentState)
}

export const handleCellMouseUp = (contentState, event) => {
  const { eventCenter } = contentState.muya
  for (const id of contentState.cellSelectEventIds) {
    eventCenter.detachDOMEvent(id)
  }
  contentState.cellSelectEventIds = []
  if (contentState.cellSelectInfo && contentState.cellSelectInfo.isStartSelect) {
    event.preventDefault()
    const { tableId, selectedCells, anchor, focus } = contentState.cellSelectInfo
    if (!focus) {
      return
    }
    setTimeout(() => {
      contentState.selectedTableCells = {
        tableId,
        row: Math.abs(anchor.row - focus.row) + 1,
        column: Math.abs(anchor.column - focus.column) + 1,
        cells: selectedCells.map(cell => {
          delete cell.ele
          return cell
        })
      }
      contentState.cellSelectInfo = null
      const table = contentState.getBlock(tableId)
      return contentState.singleRender(table, false)
    })
  }
}

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

export const deleteSelectedTableCells = (contentState, isCut = false) => {
  const { tableId, cells } = contentState.selectedTableCells
  const tableBlock = contentState.getBlock(tableId)
  const { row, column } = tableBlock
  const rows = new Set()
  let lastColumn = null
  let isSameColumn = true
  let hasContent = false

  for (const cell of cells) {
    const cellBlock = contentState.getBlock(cell.key)
    const rowBlock = contentState.getParent(cellBlock)
    const { column: cellColumn } = cellBlock
    rows.add(rowBlock)
    if (cellBlock.children[0].text) {
      hasContent = true
    }
    if (typeof lastColumn === 'object') {
      lastColumn = cellColumn
    } else if (cellColumn !== lastColumn) {
      isSameColumn = false
    }
    cellBlock.children[0].text = ''
  }

  const isOneColumnSelected = rows.size === +row + 1 && isSameColumn
  const isOneRowSelected = cells.length === +column + 1 && rows.size === 1
  const isWholeTableSelected = rows.size === +row + 1 && cells.length === (+row + 1) * (+column + 1)

  if (isCut && isWholeTableSelected) {
    contentState.selectedTableCells = null
    return contentState.deleteParagraph(tableId)
  }

  if (hasContent) {
    contentState.singleRender(tableBlock, false)
    return contentState.muya.dispatchChange()
  }

  const cellKey = cells[0].key
  const cellBlock = contentState.getBlock(cellKey)
  const cellContentKey = cellBlock.children[0].key
  contentState.selectedTableCells = null
  if (isOneColumnSelected) {
    return contentState.editTable({
      location: 'current',
      action: 'remove',
      target: 'column'
    }, cellContentKey)
  } else if (isOneRowSelected) {
    return contentState.editTable({
      location: 'current',
      action: 'remove',
      target: 'row'
    }, cellContentKey)
  } else if (isWholeTableSelected) {
    return contentState.deleteParagraph(tableId)
  }
}

export const selectTable = (contentState, table) => {
  contentState.cellSelectInfo = {
    anchor: {
      row: 0,
      column: 0
    },
    focus: {
      row: table.row,
      column: table.column
    },
    cells: getAllTableCells(table.key)
  }
  calculateSelectedCells(contentState)
  contentState.selectedTableCells = {
    tableId: table.key,
    row: table.row + 1,
    column: table.column + 1,
    cells: contentState.cellSelectInfo.selectedCells.map(cell => {
      delete cell.ele
      return cell
    })
  }
  contentState.cellSelectInfo = null
  contentState.muya.blur()
  return contentState.singleRender(table, false)
}

export const isSingleCellSelected = (contentState) => {
  const { selectedTableCells } = contentState
  if (selectedTableCells && selectedTableCells.cells.length === 1) {
    const key = selectedTableCells.cells[0].key
    return contentState.getBlock(key)
  }
  return null
}

export const isWholeTableSelected = (contentState) => {
  const { selectedTableCells } = contentState
  const table = selectedTableCells ? contentState.getBlock(selectedTableCells.tableId) : {}
  const { row, column } = table
  if (selectedTableCells && table && selectedTableCells.cells.length === (+row + 1) * (+column + 1)) {
    return table
  }
  return null
}
