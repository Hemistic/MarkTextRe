import { isLengthEven } from '../utils'
import {
  createTableInFigure,
  createFigure,
  createTable,
  initTable,
  tableToolBarClick,
  editTable,
  getTableBlock,
  tableBlockUpdate
} from './tableBlockSupport'

const tableBlockCtrl = ContentState => {
  ContentState.prototype.createTableInFigure = function ({ rows, columns }, tableContents = []) {
    return createTableInFigure(this, { rows, columns }, tableContents)
  }

  ContentState.prototype.createFigure = function ({ rows, columns }) {
    return createFigure(this, { rows, columns })
  }

  ContentState.prototype.createTable = function (tableChecker) {
    return createTable(this, tableChecker)
  }

  ContentState.prototype.initTable = function (block) {
    return initTable(this, block)
  }

  ContentState.prototype.tableToolBarClick = function (type) {
    return tableToolBarClick(this, type)
  }

  // insert/remove row/column
  ContentState.prototype.editTable = function ({ location, action, target }, cellContentKey) {
    return editTable(this, { location, action, target }, cellContentKey)
  }

  ContentState.prototype.getTableBlock = function () {
    return getTableBlock(this)
  }

  ContentState.prototype.tableBlockUpdate = function (block) {
    return tableBlockUpdate(this, block, isLengthEven)
  }
}

export default tableBlockCtrl
