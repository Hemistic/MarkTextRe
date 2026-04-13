export const createTableCell = (contentState, type, column, value = {}) => {
  const cell = contentState.createBlock(type, {
    align: value.align || '',
    column
  })
  const cellContent = contentState.createBlock('span', {
    text: value.text || '',
    functionType: 'cellContent'
  })

  contentState.appendChild(cell, cellContent)
  return cell
}

export const createTableRow = (contentState, isHeader, columns, rowContents) => {
  const rowBlock = contentState.createBlock('tr')

  for (let column = 0; column < columns; column++) {
    const cell = createTableCell(contentState, isHeader ? 'th' : 'td', column, rowContents ? rowContents[column] : null)
    contentState.appendChild(rowBlock, cell)
  }

  return rowBlock
}

export const parseTableHeaderRow = text => {
  const rowHeader = []
  const len = text.length

  for (let i = 0; i < len; i++) {
    const char = text[i]
    if (/^[^|]$/.test(char)) {
      rowHeader[rowHeader.length - 1] += char
    }
    if (/\\/.test(char)) {
      rowHeader[rowHeader.length - 1] += text[++i]
    }
    if (/\|/.test(char) && i !== len - 1) {
      rowHeader.push('')
    }
  }

  return rowHeader
}
