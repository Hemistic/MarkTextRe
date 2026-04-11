import { EVENT_KEYS, CLASS_OR_ID } from '../config'
import { findNearestParagraph } from '../selection/dom'
import selection from '../selection'

const adjustOffset = (offset, block, event) => {
  if (/^span$/.test(block.type) && block.functionType === 'atxLine' && event.key === EVENT_KEYS.ArrowDown) {
    const match = /^\s{0,3}(?:#{1,6})(?:\s{1,}|$)/.exec(block.text)
    if (match) {
      return match[0].length
    }
  }
  return offset
}

export const findNextRowCell = (contentState, cell) => {
  if (cell.functionType !== 'cellContent') {
    throw new Error(`block with type ${cell && cell.type} is not a table cell`)
  }
  const thOrTd = contentState.getParent(cell)
  const row = contentState.closest(cell, 'tr')
  const rowContainer = contentState.closest(row, /thead|tbody/)
  const column = row.children.indexOf(thOrTd)
  if (rowContainer.type === 'thead') {
    const tbody = contentState.getNextSibling(rowContainer)
    if (tbody && tbody.children.length) {
      return tbody.children[0].children[column].children[0]
    }
  } else if (rowContainer.type === 'tbody') {
    const nextRow = contentState.getNextSibling(row)
    if (nextRow) {
      return nextRow.children[column].children[0]
    }
  }
  return null
}

export const findPrevRowCell = (contentState, cell) => {
  if (cell.functionType !== 'cellContent') {
    throw new Error(`block with type ${cell && cell.type} is not a table cell`)
  }
  const thOrTd = contentState.getParent(cell)
  const row = contentState.closest(cell, 'tr')
  const rowContainer = contentState.getParent(row)
  const rowIndex = rowContainer.children.indexOf(row)
  const column = row.children.indexOf(thOrTd)
  if (rowContainer.type === 'tbody') {
    if (rowIndex === 0 && rowContainer.preSibling) {
      const thead = contentState.getPreSibling(rowContainer)
      return thead.children[0].children[column].children[0]
    } else if (rowIndex > 0) {
      return contentState.getPreSibling(row).children[column].children[0]
    }
  }
  return null
}

export const docArrowHandler = (contentState, event) => {
  const { selectedImage } = contentState
  if (!selectedImage) {
    return false
  }

  const { key, token } = selectedImage
  const { start, end } = token.range
  event.preventDefault()
  event.stopPropagation()
  const block = contentState.getBlock(key)
  switch (event.key) {
    case EVENT_KEYS.ArrowUp:
    case EVENT_KEYS.ArrowLeft:
      contentState.cursor = {
        start: { key, offset: start },
        end: { key, offset: start }
      }
      break
    case EVENT_KEYS.ArrowDown:
    case EVENT_KEYS.ArrowRight:
      contentState.cursor = {
        start: { key, offset: end },
        end: { key, offset: end }
      }
      break
  }
  contentState.muya.keyboard.hideAllFloatTools()
  contentState.singleRender(block)
  return true
}

const handleMathArrowRight = (event, node, start, end) => {
  if (event.key === EVENT_KEYS.ArrowRight && node && node.classList && node.classList.contains(CLASS_OR_ID.AG_MATH_TEXT)) {
    const { right } = selection.getCaretOffsets(node)
    if (right === 0 && start.key === end.key && start.offset === end.offset) {
      selection.select(node.parentNode.nextElementSibling, 0)
      return true
    }
  }
  return false
}

const shouldIgnoreArrow = (event, start, end) => {
  return (
    (start.key === end.key && start.offset !== end.offset) ||
    start.key !== end.key ||
    event.shiftKey
  )
}

const canKeepNativeVerticalArrow = (event, block, topOffset, bottomOffset) => {
  if (
    (event.key === EVENT_KEYS.ArrowUp && topOffset > 0) ||
    (event.key === EVENT_KEYS.ArrowDown && bottomOffset > 0)
  ) {
    if (!/pre/.test(block.type) || block.functionType !== 'cellContent') {
      return true
    }
  }
  return false
}

const moveBetweenTableCells = (contentState, event, block) => {
  if (block.functionType !== 'cellContent') {
    return false
  }

  let activeBlock
  const cellInNextRow = contentState.findNextRowCell(block)
  const cellInPrevRow = contentState.findPrevRowCell(block)

  if (event.key === EVENT_KEYS.ArrowUp) {
    activeBlock = cellInPrevRow || contentState.findPreBlockInLocation(contentState.getTableBlock())
  }

  if (event.key === EVENT_KEYS.ArrowDown) {
    activeBlock = cellInNextRow || contentState.findNextBlockInLocation(contentState.getTableBlock())
  }

  if (!activeBlock) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  let offset = activeBlock.type === 'p'
    ? 0
    : (event.key === EVENT_KEYS.ArrowUp ? activeBlock.text.length : 0)
  offset = adjustOffset(offset, activeBlock, event)

  const key = activeBlock.type === 'p' ? activeBlock.children[0].key : activeBlock.key
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

const moveToPreviousBlock = (contentState, event, preBlock) => {
  event.preventDefault()
  event.stopPropagation()
  if (!preBlock) return true
  const key = preBlock.key
  const offset = preBlock.text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

const moveToNextBlock = (contentState, event, block, nextBlock) => {
  event.preventDefault()
  event.stopPropagation()
  let key
  let newBlock
  if (nextBlock) {
    key = nextBlock.key
  } else {
    newBlock = contentState.createBlockP()
    const lastBlock = contentState.blocks[contentState.blocks.length - 1]
    contentState.insertAfter(newBlock, lastBlock)
    key = newBlock.children[0].key
  }
  const offset = adjustOffset(0, nextBlock || newBlock, event)
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

export const arrowHandler = (contentState, event) => {
  const node = selection.getSelectionStart()
  const paragraph = findNearestParagraph(node)
  const id = paragraph.id
  const block = contentState.getBlock(id)
  const preBlock = contentState.findPreBlockInLocation(block)
  const nextBlock = contentState.findNextBlockInLocation(block)
  const { start, end } = selection.getCursorRange()
  const { topOffset, bottomOffset } = selection.getCursorYOffset(paragraph)
  if (!start || !end) {
    return
  }

  if (handleMathArrowRight(event, node, start, end)) {
    return
  }

  if (shouldIgnoreArrow(event, start, end)) {
    return
  }

  if (canKeepNativeVerticalArrow(event, block, topOffset, bottomOffset)) {
    return
  }

  if (moveBetweenTableCells(contentState, event, block)) {
    return
  }

  if (
    event.key === EVENT_KEYS.ArrowUp ||
    (event.key === EVENT_KEYS.ArrowLeft && start.offset === 0)
  ) {
    return moveToPreviousBlock(contentState, event, preBlock)
  } else if (
    event.key === EVENT_KEYS.ArrowDown ||
    (event.key === EVENT_KEYS.ArrowRight && start.offset === block.text.length)
  ) {
    return moveToNextBlock(contentState, event, block, nextBlock)
  }
}
