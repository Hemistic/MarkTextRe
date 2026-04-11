const LIST_ITEM_REG = /^ {0,3}(?:[*+-]|\d{1,9}(?:\.|\))) {0,4}/
const TASK_LIST_REG = /^\[[x ]\] {1,4}/i

const syncLooseListItems = list => {
  const isLooseListItem = list.children.some(child => child.isLooseListItem)
  list.children.forEach(child => {
    child.isLooseListItem = isLooseListItem
  })
}

export const updateList = (contentState, block, type, marker = '', line) => {
  const cleanMarker = marker ? marker.trim() : null
  const { preferLooseListItem } = contentState.muya.options
  const wrapperTag = type === 'order' ? 'ol' : 'ul'
  const { start, end } = contentState.cursor
  const startOffset = start.offset
  const endOffset = end.offset
  const newListItemBlock = contentState.createBlock('li')
  const text = line.text
  const lines = text.split('\n')

  const preParagraphLines = []
  let listItemLines = []
  let isPushedListItemLine = false
  if (marker) {
    for (const currentLine of lines) {
      if (LIST_ITEM_REG.test(currentLine) && !isPushedListItemLine) {
        listItemLines.push(currentLine.replace(LIST_ITEM_REG, ''))
        isPushedListItemLine = true
      } else if (!isPushedListItemLine) {
        preParagraphLines.push(currentLine)
      } else {
        listItemLines.push(currentLine)
      }
    }
  } else {
    listItemLines = lines
  }

  const pBlock = contentState.createBlockP(listItemLines.join('\n'))
  contentState.insertBefore(pBlock, block)

  if (preParagraphLines.length > 0) {
    const preParagraphBlock = contentState.createBlockP(preParagraphLines.join('\n'))
    contentState.insertBefore(preParagraphBlock, pBlock)
  }

  contentState.removeBlock(block)
  block = pBlock

  const preSibling = contentState.getPreSibling(block)
  const nextSibling = contentState.getNextSibling(block)
  newListItemBlock.listItemType = type
  newListItemBlock.isLooseListItem = preferLooseListItem

  let bulletMarkerOrDelimiter
  if (type === 'order') {
    bulletMarkerOrDelimiter = (cleanMarker && cleanMarker.length >= 2) ? cleanMarker.slice(-1) : '.'
  } else {
    const { bulletListMarker } = contentState.muya.options
    bulletMarkerOrDelimiter = marker ? marker.charAt(0) : bulletListMarker
  }
  newListItemBlock.bulletMarkerOrDelimiter = bulletMarkerOrDelimiter

  if (
    preSibling &&
    contentState.checkSameMarkerOrDelimiter(preSibling, bulletMarkerOrDelimiter) &&
    nextSibling &&
    contentState.checkSameMarkerOrDelimiter(nextSibling, bulletMarkerOrDelimiter)
  ) {
    contentState.appendChild(preSibling, newListItemBlock)
    const partChildren = nextSibling.children.splice(0)
    partChildren.forEach(child => contentState.appendChild(preSibling, child))
    contentState.removeBlock(nextSibling)
    contentState.removeBlock(block)
    syncLooseListItems(preSibling)
  } else if (
    preSibling &&
    contentState.checkSameMarkerOrDelimiter(preSibling, bulletMarkerOrDelimiter)
  ) {
    contentState.appendChild(preSibling, newListItemBlock)
    contentState.removeBlock(block)
    syncLooseListItems(preSibling)
  } else if (
    nextSibling &&
    contentState.checkSameMarkerOrDelimiter(nextSibling, bulletMarkerOrDelimiter)
  ) {
    contentState.insertBefore(newListItemBlock, nextSibling.children[0])
    contentState.removeBlock(block)
    syncLooseListItems(nextSibling)
  } else {
    const listBlock = contentState.createBlock(wrapperTag, {
      listType: type
    })

    if (wrapperTag === 'ol') {
      const start = cleanMarker ? cleanMarker.slice(0, -1) : 1
      listBlock.start = /^\d+$/.test(start) ? start : 1
    }

    contentState.appendChild(listBlock, newListItemBlock)
    contentState.insertBefore(listBlock, block)
    contentState.removeBlock(block)
  }

  contentState.appendChild(newListItemBlock, block)
  const listItemText = block.children[0].text
  const { key } = block.children[0]
  const delta = marker.length + preParagraphLines.join('\n').length + 1
  contentState.cursor = {
    start: {
      key,
      offset: Math.max(0, startOffset - delta)
    },
    end: {
      key,
      offset: Math.max(0, endOffset - delta)
    }
  }

  if (TASK_LIST_REG.test(listItemText)) {
    const match = TASK_LIST_REG.exec(listItemText)
    const tasklist = match ? match[0] : ''
    return updateTaskListItem(contentState, block, 'tasklist', tasklist)
  } else {
    return block
  }
}

export const updateTaskListItem = (contentState, block, type, marker = '') => {
  const { preferLooseListItem } = contentState.muya.options
  const parent = contentState.getParent(block)
  const grandpa = contentState.getParent(parent)
  const checked = /\[x\]\s/i.test(marker)
  const checkbox = contentState.createBlock('input', {
    checked
  })
  const { start, end } = contentState.cursor

  contentState.insertBefore(checkbox, block)
  block.children[0].text = block.children[0].text.substring(marker.length)
  parent.listItemType = 'task'
  parent.isLooseListItem = preferLooseListItem

  let taskListWrapper
  if (contentState.isOnlyChild(parent)) {
    grandpa.listType = 'task'
  } else if (contentState.isFirstChild(parent) || contentState.isLastChild(parent)) {
    taskListWrapper = contentState.createBlock('ul', {
      listType: 'task'
    })

    contentState.isFirstChild(parent)
      ? contentState.insertBefore(taskListWrapper, grandpa)
      : contentState.insertAfter(taskListWrapper, grandpa)
    contentState.removeBlock(parent)
    contentState.appendChild(taskListWrapper, parent)
  } else {
    taskListWrapper = contentState.createBlock('ul', {
      listType: 'task'
    })

    const bulletListWrapper = contentState.createBlock('ul', {
      listType: 'bullet'
    })

    let preSibling = contentState.getPreSibling(parent)
    while (preSibling) {
      contentState.removeBlock(preSibling)
      if (bulletListWrapper.children.length) {
        const firstChild = bulletListWrapper.children[0]
        contentState.insertBefore(preSibling, firstChild)
      } else {
        contentState.appendChild(bulletListWrapper, preSibling)
      }
      preSibling = contentState.getPreSibling(preSibling)
    }

    contentState.removeBlock(parent)
    contentState.appendChild(taskListWrapper, parent)
    contentState.insertBefore(taskListWrapper, grandpa)
    contentState.insertBefore(bulletListWrapper, taskListWrapper)
  }

  contentState.cursor = {
    start: {
      key: start.key,
      offset: Math.max(0, start.offset - marker.length)
    },
    end: {
      key: end.key,
      offset: Math.max(0, end.offset - marker.length)
    }
  }

  return taskListWrapper || grandpa
}
