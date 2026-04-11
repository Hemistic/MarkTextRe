import { getAllTableCells, getIndex } from './tableDomUtils'
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  hideUnnecessaryBar,
  calculateCurIndex,
  setDragTargetStyle,
  setSwitchStyle,
  setDropTargetStyle,
  switchTableData,
  resetDragTableBar
} from './tableDragSupport'

export { getAllTableCells, getIndex }

const tableDragBarCtrl = ContentState => {
  ContentState.prototype.handleMouseDown = function (event) {
    return handleMouseDown(this, event)
  }

  ContentState.prototype.handleMouseMove = function (event) {
    return handleMouseMove(this, event)
  }

  ContentState.prototype.handleMouseUp = function (event) {
    return handleMouseUp(this, event)
  }

  ContentState.prototype.hideUnnecessaryBar = function () {
    return hideUnnecessaryBar(this)
  }

  ContentState.prototype.calculateCurIndex = function () {
    return calculateCurIndex(this)
  }

  ContentState.prototype.setDragTargetStyle = function () {
    return setDragTargetStyle(this)
  }

  ContentState.prototype.setSwitchStyle = function () {
    return setSwitchStyle(this)
  }

  ContentState.prototype.setDropTargetStyle = function () {
    return setDropTargetStyle(this)
  }

  ContentState.prototype.switchTableData = function () {
    return switchTableData(this)
  }

  ContentState.prototype.resetDragTableBar = function () {
    return resetDragTableBar(this)
  }
}

export default tableDragBarCtrl
