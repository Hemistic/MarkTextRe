import { getAllTableCells, getIndex } from './tableDomUtils'
import { getContentStateDocument } from './runtimeDomSupport'
import { getContentStateEventCenter } from './runtimeMuyaSupport'

export const handleCellMouseDown = (contentState, event) => {
  if (event.buttons === 2) {
    return
  }
  const eventCenter = getContentStateEventCenter(contentState)
  const doc = getContentStateDocument(contentState)
  if (!doc || !doc.body || !eventCenter) {
    return
  }
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
    cells: getAllTableCells(contentState, tableId),
    selectedCells: []
  }

  const mouseMoveId = eventCenter.attachDOMEvent(doc.body, 'mousemove', contentState.handleCellMouseMove.bind(contentState))
  const mouseUpId = eventCenter.attachDOMEvent(doc.body, 'mouseup', contentState.handleCellMouseUp.bind(contentState))
  contentState.cellSelectEventIds.push(mouseMoveId, mouseUpId)
}

export const handleCellMouseUp = (contentState, event) => {
  const eventCenter = getContentStateEventCenter(contentState)
  if (eventCenter) {
    for (const id of contentState.cellSelectEventIds) {
      eventCenter.detachDOMEvent(id)
    }
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
