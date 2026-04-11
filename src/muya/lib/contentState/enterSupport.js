export const chopBlockByCursor = (contentState, block, key, offset) => {
  const newBlock = contentState.createBlock('p')
  const { children } = block
  const index = children.findIndex(child => child.key === key)
  const activeLine = contentState.getBlock(key)
  const { text } = activeLine

  newBlock.children = children.splice(index + 1)
  newBlock.children.forEach(child => {
    child.parent = newBlock.key
  })
  children[index].nextSibling = null

  if (newBlock.children.length) {
    newBlock.children[0].preSibling = null
  }

  if (offset === 0) {
    contentState.removeBlock(activeLine, children)
    contentState.prependChild(newBlock, activeLine)
  } else if (offset < text.length) {
    activeLine.text = text.substring(0, offset)
    const newLine = contentState.createBlock('span', { text: text.substring(offset) })
    contentState.prependChild(newBlock, newLine)
  }

  return newBlock
}

export const chopBlock = (contentState, block) => {
  const parent = contentState.getParent(block)
  const type = parent.type
  const container = contentState.createBlock(type)
  const index = contentState.findIndex(parent.children, block)
  const partChildren = parent.children.splice(index + 1)

  block.nextSibling = null
  partChildren.forEach(child => {
    contentState.appendChild(container, child)
  })
  contentState.insertAfter(container, parent)

  return container
}

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

export const enterInEmptyParagraph = (contentState, block) => {
  if (block.type === 'span') block = contentState.getParent(block)
  const parent = contentState.getParent(block)
  let newBlock = null

  if (parent && (/ul|ol|blockquote/.test(parent.type))) {
    newBlock = contentState.createBlockP()
    if (contentState.isOnlyChild(block)) {
      contentState.insertAfter(newBlock, parent)
      contentState.removeBlock(parent)
    } else if (contentState.isFirstChild(block)) {
      contentState.insertBefore(newBlock, parent)
    } else if (contentState.isLastChild(block)) {
      contentState.insertAfter(newBlock, parent)
    } else {
      chopBlock(contentState, block)
      contentState.insertAfter(newBlock, parent)
    }

    contentState.removeBlock(block)
  } else if (parent && parent.type === 'li') {
    if (parent.listItemType === 'task') {
      const { checked } = parent.children[0]
      newBlock = createTaskItemBlock(contentState, null, checked)
    } else {
      newBlock = createBlockLi(contentState)
      newBlock.listItemType = parent.listItemType
      newBlock.bulletMarkerOrDelimiter = parent.bulletMarkerOrDelimiter
    }
    newBlock.isLooseListItem = parent.isLooseListItem
    contentState.insertAfter(newBlock, parent)
    const index = contentState.findIndex(parent.children, block)
    const blocksInListItem = parent.children.splice(index + 1)
    blocksInListItem.forEach(child => contentState.appendChild(newBlock, child))
    contentState.removeBlock(block)

    newBlock = newBlock.listItemType === 'task'
      ? newBlock.children[1]
      : newBlock.children[0]
  } else {
    newBlock = contentState.createBlockP()
    if (block.type === 'li') {
      contentState.insertAfter(newBlock, parent)
      contentState.removeBlock(block)
    } else {
      contentState.insertAfter(newBlock, block)
    }
  }

  const { key } = newBlock.children[0]
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  return contentState.partialRender()
}

export const getFirstBlockInNextRow = (contentState, row) => {
  let nextSibling = contentState.getBlock(row.nextSibling)
  if (!nextSibling) {
    const rowContainer = contentState.getBlock(row.parent)
    const table = contentState.getBlock(rowContainer.parent)
    const figure = contentState.getBlock(table.parent)

    if (rowContainer.type === 'thead' && table.children[1]) {
      nextSibling = table.children[1]
    } else if (figure.nextSibling) {
      nextSibling = contentState.getBlock(figure.nextSibling)
    } else {
      nextSibling = contentState.createBlockP()
      contentState.insertAfter(nextSibling, figure)
    }
  }

  return contentState.firstInDescendant(nextSibling)
}

export const getParagraphBlock = block => {
  if (block.type === 'li') {
    return block.listItemType === 'task' ? block.children[1] : block.children[0]
  } else {
    return block
  }
}
