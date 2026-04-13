import { calculateAspects, getAllTableCells, getIndex, getDragCells } from './tableDomUtils'
import {
  hideUnnecessaryBar,
  calculateCurIndex,
  setDragTargetStyle,
  setSwitchStyle,
  setDropTargetStyle,
  resetDragTableBar
} from './tableDragStyleSupport'
import { switchTableData } from './tableDragDataSupport'
import { getContentStateDocument } from './runtimeDomSupport'
import { getContentStateEventCenter } from './runtimeMuyaSupport'

export const handleMouseDown = (contentState, event) => {
  event.preventDefault()
  const eventCenter = getContentStateEventCenter(contentState)
  const doc = getContentStateDocument(contentState)
  if (!doc || !eventCenter) {
    return
  }
  const { clientX, clientY, target } = event
  const tableId = target.closest('table').id
  const barType = target.classList.contains('left') ? 'left' : 'bottom'
  const index = getIndex(barType, target)

  contentState.dragInfo = {
    tableId,
    clientX,
    clientY,
    barType,
    index,
    curIndex: index,
    dragCells: getDragCells(contentState, tableId, barType, index),
    cells: getAllTableCells(contentState, tableId),
    aspects: calculateAspects(contentState, tableId, barType),
    offset: 0
  }

  for (const row of contentState.dragInfo.cells) {
    for (const cell of row) {
      if (!contentState.dragInfo.dragCells.includes(cell)) {
        cell.classList.add('ag-cell-transform')
      }
    }
  }

  const mouseMoveId = eventCenter.attachDOMEvent(doc, 'mousemove', contentState.handleMouseMove.bind(contentState))
  const mouseUpId = eventCenter.attachDOMEvent(doc, 'mouseup', contentState.handleMouseUp.bind(contentState))
  contentState.dragEventIds.push(mouseMoveId, mouseUpId)
}

export const handleMouseMove = (contentState, event) => {
  if (!contentState.dragInfo) {
    return
  }
  const { barType } = contentState.dragInfo
  const attrName = barType === 'bottom' ? 'clientX' : 'clientY'
  const offset = contentState.dragInfo.offset = event[attrName] - contentState.dragInfo[attrName]
  if (Math.abs(offset) < 5) {
    return
  }
  contentState.isDragTableBar = true
  hideUnnecessaryBar(contentState)
  calculateCurIndex(contentState)
  setDragTargetStyle(contentState)
  setSwitchStyle(contentState)
}

export const handleMouseUp = (contentState, event) => {
  const eventCenter = getContentStateEventCenter(contentState)
  if (!eventCenter) {
    contentState.dragEventIds = []
    return
  }
  for (const id of contentState.dragEventIds) {
    eventCenter.detachDOMEvent(id)
  }
  contentState.dragEventIds = []
  if (!contentState.isDragTableBar) {
    return
  }

  setDropTargetStyle(contentState)
  setTimeout(() => {
    switchTableData(contentState)
    resetDragTableBar(contentState)
  }, 300)
}
