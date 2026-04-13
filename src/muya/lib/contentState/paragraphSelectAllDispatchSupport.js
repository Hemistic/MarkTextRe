import { selectAllContent } from './paragraphSelectAllRangeSupport'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const selectAll = contentState => {
  const mayBeCell = contentState.isSingleCellSelected()
  const mayBeTable = contentState.isWholeTableSelected()

  if (mayBeTable) {
    contentState.selectedTableCells = null
    return selectAllContent(contentState)
  }

  if (mayBeCell) {
    const table = contentState.closest(mayBeCell, 'table')

    if (table) {
      return contentState.selectTable(table)
    }
  }
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (startBlock.functionType === 'cellContent' && endBlock.functionType === 'cellContent') {
    if (start.key === end.key) {
      const table = contentState.closest(startBlock, 'table')
      const cellBlock = contentState.closest(startBlock, /th|td/)

      contentState.selectedTableCells = {
        tableId: table.key,
        row: 1,
        column: 1,
        cells: [{
          key: cellBlock.key,
          text: cellBlock.children[0].text,
          top: true,
          right: true,
          bottom: true,
          left: true
        }]
      }

      contentState.singleRender(table, false)
      return dispatchContentStateEvent(contentState, 'muya-format-picker', { reference: null })
    } else {
      const startTable = contentState.closest(startBlock, 'table')
      const endTable = contentState.closest(endBlock, 'table')
      if (!startTable || !endTable) {
        console.error('No table found or invalid type.')
        return
      } else if (startTable.key !== endTable.key) {
        return
      }
      return contentState.selectTable(startTable)
    }
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'codeContent') {
    const { key } = startBlock
    contentState.cursor = {
      start: {
        key,
        offset: 0
      },
      end: {
        key,
        offset: startBlock.text.length
      }
    }

    return contentState.partialRender()
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'languageInput') {
    contentState.cursor = {
      start: {
        key: startBlock.key,
        offset: 0
      },
      end: {
        key: startBlock.key,
        offset: startBlock.text.length
      }
    }
    return contentState.partialRender()
  }

  return selectAllContent(contentState)
}
