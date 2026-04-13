const TABLE_BLOCK_REG = /^\|.*?(\\*)\|.*?(\\*)\|/

import { createTableInFigure } from './tableFigureSupport'
import { parseTableHeaderRow } from './tableCreateSupport'

export const initTable = (contentState, block) => {
  const { text } = block.children[0]
  const rowHeader = parseTableHeaderRow(text)

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

export const tableBlockUpdate = (contentState, block, isLengthEven) => {
  const { type } = block
  if (type !== 'p') return false
  const { text } = block.children[0]
  const match = TABLE_BLOCK_REG.exec(text)
  return (match && isLengthEven(match[1]) && isLengthEven(match[2])) ? initTable(contentState, block) : false
}
