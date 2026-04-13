import { setCursor } from './tableCursorSupport'
import { createTableRow } from './tableCreateSupport'
import { dispatchContentStateSelectionAndChange } from './runtimeEventSupport'

export const createTableInFigure = (contentState, { rows, columns }, tableContents = []) => {
  const table = contentState.createBlock('table', {
    row: rows - 1,
    column: columns - 1
  })
  const tHead = contentState.createBlock('thead')
  const tBody = contentState.createBlock('tbody')

  for (let i = 0; i < rows; i++) {
    const rowContents = tableContents[i]
    const rowBlock = createTableRow(contentState, i === 0, columns, rowContents)
    i === 0 ? contentState.appendChild(tHead, rowBlock) : contentState.appendChild(tBody, rowBlock)
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

  dispatchContentStateSelectionAndChange(contentState)
}
