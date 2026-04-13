import { getParagraphReference } from '../utils'
import { resizeTable } from './tableResizeMutationSupport'
import { queryContentState } from './runtimeDomSupport'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleTablePicker = (contentState, table, figureKey) => {
  const tableEle = queryContentState(contentState, `#${figureKey} [data-label=table]`)
  if (!tableEle) {
    return
  }
  const { row = 1, column = 1 } = table
  const handler = (nextRow, nextColumn) => resizeTable(contentState, table, nextRow, nextColumn)
  const reference = getParagraphReference(tableEle, tableEle.id)

  dispatchContentStateEvent(contentState, 'muya-table-picker', { row, column }, reference, handler)
}
