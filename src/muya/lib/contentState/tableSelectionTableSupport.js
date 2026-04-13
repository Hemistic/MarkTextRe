import { getAllTableCells } from './tableDomUtils'
import { calculateSelectedCells } from './tableSelectionCellsSupport'
import { blurContentState } from './runtimeMuyaSupport'

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
    cells: getAllTableCells(contentState, table.key)
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
  blurContentState(contentState)
  return contentState.singleRender(table, false)
}

export const isSingleCellSelected = contentState => {
  const { selectedTableCells } = contentState
  if (selectedTableCells && selectedTableCells.cells.length === 1) {
    const key = selectedTableCells.cells[0].key
    return contentState.getBlock(key)
  }
  return null
}

export const isWholeTableSelected = contentState => {
  const { selectedTableCells } = contentState
  const table = selectedTableCells ? contentState.getBlock(selectedTableCells.tableId) : {}
  const { row, column } = table
  if (selectedTableCells && table && selectedTableCells.cells.length === (+row + 1) * (+column + 1)) {
    return table
  }
  return null
}
