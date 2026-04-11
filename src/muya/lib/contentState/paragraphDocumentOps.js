export const insertParagraph = (contentState, location, text = '', outMost = false) => {
  const { start, end } = contentState.cursor
  if (start.key !== end.key) return

  const block = contentState.getBlock(start.key)
  let anchor = null
  if (outMost) {
    anchor = contentState.findOutMostBlock(block)
  } else {
    anchor = contentState.getAnchor(block)
  }

  if (!anchor || anchor && anchor.functionType === 'frontmatter' && location === 'before') {
    return
  }

  const newBlock = contentState.createBlockP(text)
  if (location === 'before') {
    contentState.insertBefore(newBlock, anchor)
  } else {
    contentState.insertAfter(newBlock, anchor)
  }
  const { key } = newBlock.children[0]
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  contentState.muya.eventCenter.dispatch('stateChange')
}

export const duplicateParagraph = contentState => {
  const { start, end } = contentState.cursor
  const startOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(start.key))
  const endOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(end.key))
  if (startOutmostBlock !== endOutmostBlock) {
    return
  }

  const copiedBlock = contentState.copyBlock(startOutmostBlock)
  contentState.insertAfter(copiedBlock, startOutmostBlock)

  const cursorBlock = contentState.firstInDescendant(copiedBlock)
  const { key, text } = cursorBlock
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return contentState.muya.eventCenter.dispatch('stateChange')
}

export const deleteParagraph = (contentState, blockKey) => {
  let startOutmostBlock
  if (blockKey) {
    const block = contentState.getBlock(blockKey)
    const firstEditableBlock = contentState.firstInDescendant(block)
    startOutmostBlock = contentState.getAnchor(firstEditableBlock)
  } else {
    const { start, end } = contentState.cursor
    startOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(start.key))
    const endOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(end.key))
    if (startOutmostBlock !== endOutmostBlock) {
      return
    }
  }

  const preBlock = contentState.getBlock(startOutmostBlock.preSibling)
  const nextBlock = contentState.getBlock(startOutmostBlock.nextSibling)
  let cursorBlock = null
  if (nextBlock) {
    cursorBlock = contentState.firstInDescendant(nextBlock)
  } else if (preBlock) {
    cursorBlock = contentState.lastInDescendant(preBlock)
  } else {
    const newBlock = contentState.createBlockP()
    contentState.insertAfter(newBlock, startOutmostBlock)
    cursorBlock = contentState.firstInDescendant(newBlock)
  }
  contentState.removeBlock(startOutmostBlock)
  const { key, text } = cursorBlock
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return contentState.muya.eventCenter.dispatch('stateChange')
}

export const isSelectAll = contentState => {
  const firstTextBlock = contentState.getFirstBlock()
  const lastTextBlock = contentState.getLastBlock()
  const { start, end } = contentState.cursor

  return firstTextBlock.key === start.key &&
    start.offset === 0 &&
    lastTextBlock.key === end.key &&
    end.offset === lastTextBlock.text.length &&
    !contentState.muya.keyboard.isComposed
}

export const selectAllContent = contentState => {
  const firstTextBlock = contentState.getFirstBlock()
  const lastTextBlock = contentState.getLastBlock()
  contentState.cursor = {
    start: {
      key: firstTextBlock.key,
      offset: 0
    },
    end: {
      key: lastTextBlock.key,
      offset: lastTextBlock.text.length
    }
  }

  return contentState.render()
}

export const selectAll = contentState => {
  const mayBeCell = contentState.isSingleCellSelected()
  const mayBeTable = contentState.isWholeTableSelected()

  if (mayBeTable) {
    contentState.selectedTableCells = null
    return selectAllContent(contentState)
  }

  if (mayBeCell) {
    const table = contentState.closest(mayBeCell, 'table')

    if (table) {
      return contentState.selectTable(table)
    }
  }
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (startBlock.functionType === 'cellContent' && endBlock.functionType === 'cellContent') {
    if (start.key === end.key) {
      const table = contentState.closest(startBlock, 'table')
      const cellBlock = contentState.closest(startBlock, /th|td/)

      contentState.selectedTableCells = {
        tableId: table.key,
        row: 1,
        column: 1,
        cells: [{
          key: cellBlock.key,
          text: cellBlock.children[0].text,
          top: true,
          right: true,
          bottom: true,
          left: true
        }]
      }

      contentState.singleRender(table, false)
      return contentState.muya.eventCenter.dispatch('muya-format-picker', { reference: null })
    } else {
      const startTable = contentState.closest(startBlock, 'table')
      const endTable = contentState.closest(endBlock, 'table')
      if (!startTable || !endTable) {
        console.error('No table found or invalid type.')
        return
      } else if (startTable.key !== endTable.key) {
        return
      }
      return contentState.selectTable(startTable)
    }
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'codeContent') {
    const { key } = startBlock
    contentState.cursor = {
      start: {
        key,
        offset: 0
      },
      end: {
        key,
        offset: startBlock.text.length
      }
    }

    return contentState.partialRender()
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'languageInput') {
    contentState.cursor = {
      start: {
        key: startBlock.key,
        offset: 0
      },
      end: {
        key: startBlock.key,
        offset: startBlock.text.length
      }
    }
    return contentState.partialRender()
  }

  return selectAllContent(contentState)
}
