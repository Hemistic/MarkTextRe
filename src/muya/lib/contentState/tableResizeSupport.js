import { handleTablePicker } from './tableResizePickerSupport'
import { handleTableToolAction, resizeTable } from './tableResizeMutationSupport'

export { resizeTable } from './tableResizeMutationSupport'

export const tableToolBarClick = (contentState, type) => {
  const { start: { key } } = contentState.cursor
  const block = contentState.getBlock(key)
  const parentBlock = contentState.getParent(block)

  if (block.functionType !== 'cellContent') {
    throw new Error('table is not active')
  }

  const { column, align } = parentBlock
  const table = contentState.closest(block, 'table')
  const figure = contentState.getBlock(table.parent)

  if (type === 'table') {
    handleTablePicker(contentState, table, figure.key)
    return
  }

  handleTableToolAction(contentState, table, figure, column, align, type)
}
