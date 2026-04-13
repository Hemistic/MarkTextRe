import { getIndex } from './tableDomUtils'
import { calculateSelectedCells, setSelectedCellsStyle } from './tableSelectionStateSupport'
import { blurContentState } from './runtimeMuyaSupport'

export const handleCellMouseMove = (contentState, event) => {
  const { target } = event
  const cell = target.closest('th') || target.closest('td')
  const table = target.closest('table')
  const isOverSameTableCell = cell && table && table.id === contentState.cellSelectInfo.tableId
  if (isOverSameTableCell && cell.id !== contentState.cellSelectInfo.anchor.key) {
    contentState.cellSelectInfo.isStartSelect = true
    blurContentState(contentState, true)
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
