
const insertColumn = (contentState, context, location) => {
  const { cellBlock, thead, tbody, columnIndex } = context

  ;[...thead.children, ...tbody.children].forEach(tableRow => {
    const targetCell = tableRow.children[columnIndex]
    const cell = contentState.createBlock(targetCell.type, {
      align: ''
    })
    const cellContent = contentState.createBlock('span', {
      functionType: 'cellContent'
    })
    contentState.appendChild(cell, cellContent)
    if (location === 'left') {
      contentState.insertBefore(cell, targetCell)
    } else {
      contentState.insertAfter(cell, targetCell)
    }
    tableRow.children.forEach((tableCell, index) => {
      tableCell.column = index
    })
  })

  return location === 'left'
    ? contentState.getPreSibling(cellBlock).children[0]
    : contentState.getNextSibling(cellBlock).children[0]
}

const removeColumn = (contentState, context, location) => {
  const { block, cellBlock, currentRow, thead, tbody, columnIndex } = context
  let cursorBlock

  if (currentRow.children.length <= 2) return cursorBlock

  ;[...thead.children, ...tbody.children].forEach(tableRow => {
    const targetCell = tableRow.children[columnIndex]
    const removeCell = location === 'left'
      ? contentState.getPreSibling(targetCell)
      : (location === 'current' ? targetCell : contentState.getNextSibling(targetCell))
    if (removeCell === cellBlock) {
      cursorBlock = contentState.findNextBlockInLocation(block)
    }

    if (removeCell) {
      contentState.removeBlock(removeCell)
    }
    tableRow.children.forEach((tableCell, index) => {
      tableCell.column = index
    })
  })

  return cursorBlock
}

export const editTableColumn = (contentState, context, action, location) => {
  return action === 'insert'
    ? insertColumn(contentState, context, location)
    : removeColumn(contentState, context, location)
}
