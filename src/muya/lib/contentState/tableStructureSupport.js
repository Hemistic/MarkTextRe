const TABLE_BLOCK_REG = /^\|.*?(\\*)\|.*?(\\*)\|/

const setCursor = (contentState, block, offset = 0) => {
  const { key } = block
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const createTableInFigure = (contentState, { rows, columns }, tableContents = []) => {
  const table = contentState.createBlock('table', {
    row: rows - 1,
    column: columns - 1
  })
  const tHead = contentState.createBlock('thead')
  const tBody = contentState.createBlock('tbody')

  for (let i = 0; i < rows; i++) {
    const rowBlock = contentState.createBlock('tr')
    i === 0 ? contentState.appendChild(tHead, rowBlock) : contentState.appendChild(tBody, rowBlock)
    const rowContents = tableContents[i]
    for (let j = 0; j < columns; j++) {
      const cell = contentState.createBlock(i === 0 ? 'th' : 'td', {
        align: rowContents ? rowContents[j].align : '',
        column: j
      })
      const cellContent = contentState.createBlock('span', {
        text: rowContents ? rowContents[j].text : '',
        functionType: 'cellContent'
      })

      contentState.appendChild(cell, cellContent)
      contentState.appendChild(rowBlock, cell)
    }
  }

  contentState.appendChild(table, tHead)
  if (tBody.children.length) {
    contentState.appendChild(table, tBody)
  }

  return table
}

export const createFigure = (contentState, { rows, columns }) => {
  const { end } = contentState.cursor
  const table = createTableInFigure(contentState, { rows, columns })
  const figureBlock = contentState.createBlock('figure', {
    functionType: 'table'
  })
  const endBlock = contentState.getBlock(end.key)
  const anchor = contentState.getAnchor(endBlock)

  if (!anchor) {
    return
  }

  contentState.insertAfter(figureBlock, anchor)
  if (/p|h\d/.test(anchor.type) && !endBlock.text) {
    contentState.removeBlock(anchor)
  }
  contentState.appendChild(figureBlock, table)
  setCursor(contentState, contentState.firstInDescendant(table))
  contentState.partialRender()
}

export const createTable = (contentState, tableChecker) => {
  createFigure(contentState, tableChecker)

  contentState.muya.dispatchSelectionChange()
  contentState.muya.dispatchSelectionFormats()
  contentState.muya.dispatchChange()
}

export const initTable = (contentState, block) => {
  const { text } = block.children[0]
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

  const columns = rowHeader.length
  const rows = 2
  const table = createTableInFigure(contentState, { rows, columns }, [rowHeader.map(cellText => ({ text: cellText, align: '' }))])

  block.type = 'figure'
  block.text = ''
  block.children = []
  block.functionType = 'table'
  contentState.appendChild(block, table)

  return contentState.firstInDescendant(table.children[1])
}

export const getTableBlock = contentState => {
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const affiliation = startParents.filter(parent => endParents.includes(parent))

  if (affiliation.length) {
    return affiliation.find(parent => parent.type === 'figure')
  }
}

export const tableBlockUpdate = (contentState, block, isLengthEven) => {
  const { type } = block
  if (type !== 'p') return false
  const { text } = block.children[0]
  const match = TABLE_BLOCK_REG.exec(text)
  return (match && isLengthEven(match[1]) && isLengthEven(match[2])) ? initTable(contentState, block) : false
}
