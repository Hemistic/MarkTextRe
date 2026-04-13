import { dispatchContentStateChange } from './runtimeEventSupport'

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
    return dispatchContentStateChange(contentState)
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
