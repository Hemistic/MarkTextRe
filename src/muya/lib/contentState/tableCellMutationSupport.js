import {
  getCellContext,
  setCursor,
  updateTableSize
} from './tableEditContextSupport'
import { editTableRow } from './tableRowMutationSupport'
import { editTableColumn } from './tableColumnMutationSupport'
import { dispatchContentStateStateChange } from './runtimeEventSupport'

export const editTable = (contentState, { location, action, target }, cellContentKey) => {
  const context = getCellContext(contentState, cellContentKey)
  const { table, tbody, start, end } = context
  let cursorBlock

  if (target === 'row') {
    cursorBlock = editTableRow(contentState, context, action, location)
  } else if (target === 'column') {
    cursorBlock = editTableColumn(contentState, context, action, location)
  }

  updateTableSize(table)

  if (cursorBlock) {
    setCursor(contentState, cursorBlock)
  } else {
    contentState.cursor = { start, end }
  }

  if (tbody && !tbody.children.length) {
    contentState.removeBlock(tbody)
  }

  contentState.partialRender()
  dispatchContentStateStateChange(contentState)
}
