export { setCursor } from './tableCursorSupport'
import { dispatchContentStateStateChange } from './runtimeEventSupport'

export const dispatchStateAndRender = contentState => {
  dispatchContentStateStateChange(contentState)
  contentState.partialRender()
}

export const updateTableSize = table => {
  const thead = table.children[0]
  const tbody = table.children[1]
  const column = thead.children[0].children.length - 1
  const row = thead.children.length + (tbody ? tbody.children.length : 0) - 1
  Object.assign(table, { row, column })
}

export const getCellContext = (contentState, cellContentKey) => {
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
