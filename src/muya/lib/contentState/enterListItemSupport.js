export const createRow = (contentState, row, isHeader = false) => {
  const tr = contentState.createBlock('tr')
  const len = row.children.length
  for (let i = 0; i < len; i++) {
    const cell = contentState.createBlock(isHeader ? 'th' : 'td', {
      align: row.children[i].align,
      column: i
    })
    const cellContent = contentState.createBlock('span', {
      functionType: 'cellContent'
    })

    contentState.appendChild(cell, cellContent)
    contentState.appendChild(tr, cell)
  }

  return tr
}

export const createBlockLi = (contentState, paragraphInListItem) => {
  const liBlock = contentState.createBlock('li')
  if (!paragraphInListItem) {
    paragraphInListItem = contentState.createBlockP()
  }
  contentState.appendChild(liBlock, paragraphInListItem)
  return liBlock
}

export const createTaskItemBlock = (contentState, paragraphInListItem, checked = false) => {
  const listItem = contentState.createBlock('li')
  const checkboxInListItem = contentState.createBlock('input')

  listItem.listItemType = 'task'
  checkboxInListItem.checked = checked

  if (!paragraphInListItem) {
    paragraphInListItem = contentState.createBlockP()
  }
  contentState.appendChild(listItem, checkboxInListItem)
  contentState.appendChild(listItem, paragraphInListItem)

  return listItem
}
