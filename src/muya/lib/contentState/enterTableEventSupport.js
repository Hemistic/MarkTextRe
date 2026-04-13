
export const handleTableEnter = (contentState, event, block, isOsx, getFirstBlockInNextRow) => {
  if (block.functionType !== 'cellContent') {
    return false
  }

  const row = contentState.closest(block, 'tr')
  const rowContainer = contentState.getBlock(row.parent)
  const table = contentState.closest(rowContainer, 'table')

  if ((isOsx && event.metaKey) || (!isOsx && event.ctrlKey)) {
    const nextRow = contentState.createRow(row, false)
    if (rowContainer.type === 'thead') {
      let tBody = contentState.getBlock(rowContainer.nextSibling)
      if (!tBody) {
        tBody = contentState.createBlock('tbody')
        contentState.appendChild(table, tBody)
      }
      if (tBody.children.length) {
        contentState.insertBefore(nextRow, tBody.children[0])
      } else {
        contentState.appendChild(tBody, nextRow)
      }
    } else {
      contentState.insertAfter(nextRow, row)
    }
    table.row++
  }

  const { key } = getFirstBlockInNextRow(contentState, row)
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}
