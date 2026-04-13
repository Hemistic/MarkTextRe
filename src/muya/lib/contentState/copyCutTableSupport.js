import ExportMarkdown from '../utils/exportMarkdown'

export const copySelectedTable = (contentState, event) => {
  const { selectedTableCells } = contentState
  if (!selectedTableCells) {
    return false
  }

  event.preventDefault()
  const { row, column, cells } = selectedTableCells
  const tableContents = []

  for (let rowIndex = 0; rowIndex < row; rowIndex++) {
    const rowWrapper = []
    for (let columnIndex = 0; columnIndex < column; columnIndex++) {
      const cell = cells[rowIndex * column + columnIndex]

      rowWrapper.push({
        text: cell.text,
        align: cell.align
      })
    }
    tableContents.push(rowWrapper)
  }

  if (row === 1 && column === 1) {
    if (tableContents[0][0].text.length > 0) {
      event.clipboardData.setData('text/html', '')
      event.clipboardData.setData('text/plain', tableContents[0][0].text)
    }
    return true
  }

  const figureBlock = contentState.createBlock('figure', {
    functionType: 'table'
  })
  const table = contentState.createTableInFigure({ rows: row, columns: column }, tableContents)
  contentState.appendChild(figureBlock, table)
  const { isGitlabCompatibilityEnabled, listIndentation } = contentState
  const markdown = new ExportMarkdown([figureBlock], listIndentation, isGitlabCompatibilityEnabled).generate()
  if (markdown.length > 0) {
    event.clipboardData.setData('text/html', '')
    event.clipboardData.setData('text/plain', markdown)
  }

  return true
}
