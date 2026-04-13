import { dispatchStateAndRender, setCursor } from './tableEditContextSupport'

const deleteTable = (contentState, figure) => {
  const newLine = contentState.createBlock('span')
  figure.children = []
  contentState.appendChild(figure, newLine)
  figure.type = 'p'
  figure.text = ''
  setCursor(contentState, newLine)
  dispatchStateAndRender(contentState)
}

const alignTableColumn = (contentState, table, column, align, type) => {
  const newAlign = align === type ? '' : type
  table.children.forEach(rowContainer => {
    rowContainer.children.forEach(row => {
      row.children[column].align = newAlign
    })
  })
  dispatchStateAndRender(contentState)
}

export const handleTableToolAction = (contentState, table, figure, column, align, type) => {
  switch (type) {
    case 'left':
    case 'center':
    case 'right':
      alignTableColumn(contentState, table, column, align, type)
      break
    case 'delete':
      deleteTable(contentState, figure)
      break
  }
}
