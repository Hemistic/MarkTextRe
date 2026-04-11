import {
  handleCellMouseDown,
  handleCellMouseMove,
  handleCellMouseUp,
  calculateSelectedCells,
  setSelectedCellsStyle,
  deleteSelectedTableCells,
  selectTable,
  isSingleCellSelected,
  isWholeTableSelected
} from './tableSelectSupport'

const tableSelectCellsCtrl = ContentState => {
  ContentState.prototype.handleCellMouseDown = function (event) {
    return handleCellMouseDown(this, event)
  }

  ContentState.prototype.handleCellMouseMove = function (event) {
    return handleCellMouseMove(this, event)
  }

  ContentState.prototype.handleCellMouseUp = function (event) {
    return handleCellMouseUp(this, event)
  }

  ContentState.prototype.calculateSelectedCells = function () {
    return calculateSelectedCells(this)
  }

  ContentState.prototype.setSelectedCellsStyle = function () {
    return setSelectedCellsStyle(this)
  }

  // Remove the content of selected table cell, delete the row/column if selected one row/column without content.
  // Delete the table if the selected whole table is empty.
  ContentState.prototype.deleteSelectedTableCells = function (isCut = false) {
    return deleteSelectedTableCells(this, isCut)
  }

  ContentState.prototype.selectTable = function (table) {
    return selectTable(this, table)
  }

  // Return the cell block if yes, else return null.
  ContentState.prototype.isSingleCellSelected = function () {
    return isSingleCellSelected(this)
  }

  // Return the cell block if yes, else return null.
  ContentState.prototype.isWholeTableSelected = function () {
    return isWholeTableSelected(this)
  }
}

export default tableSelectCellsCtrl
