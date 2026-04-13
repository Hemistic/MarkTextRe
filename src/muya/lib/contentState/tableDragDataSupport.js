import { switchColumnData } from './tableDragColumnSupport'
import { switchRowData } from './tableDragRowSupport'

export const switchTableData = contentState => {
  const { barType, index, curIndex, tableId, offset } = contentState.dragInfo
  const table = contentState.getBlock(tableId)
  const tHead = table.children[0]
  const tBody = table.children[1]
  const rows = [tHead.children[0], ...(tBody ? tBody.children : [])]

  if (index !== curIndex) {
    const { start, end } = contentState.cursor
    let key = null
    if (barType === 'bottom') {
      key = switchColumnData(contentState, rows, index, curIndex, offset, start)
    } else {
      key = switchRowData(contentState, rows, index, curIndex, offset, start)
    }

    if (key) {
      contentState.cursor = {
        start: {
          key,
          offset: start.offset
        },
        end: {
          key,
          offset: end.offset
        }
      }
      return contentState.singleRender(table)
    }
    return contentState.partialRender()
  }
}
