import selection from '../selection'
import { findNearestParagraph } from '../selection/dom'
import {
  handleSpecialBackspaceToken,
  tableHasContent
} from './backspaceSupport'

const setCursor = (contentState, key, offset) => {
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const handleDocBackspace = (contentState, event) => {
  if (contentState.selectedImage) {
    event.preventDefault()
    contentState.deleteImage(contentState.selectedImage)
    return true
  }
  if (contentState.selectedTableCells) {
    event.preventDefault()
    contentState.deleteSelectedTableCells()
    return true
  }
  return false
}

export const handleSelectionBackspace = (contentState, event) => {
  if (contentState.selectedImage) {
    event.preventDefault()
    contentState.deleteImage(contentState.selectedImage)
    return true
  }

  if (contentState.isSelectAll()) {
    event.preventDefault()
    contentState.blocks = [contentState.createBlockP()]
    contentState.init()
    contentState.render()
    contentState.muya.dispatchSelectionChange()
    contentState.muya.dispatchSelectionFormats()
    contentState.muya.dispatchChange()
    return true
  }

  return false
}

export const handleAtxHeadingBackspace = (contentState, event, start, end, startBlock) => {
  if (
    start.key === end.key &&
    startBlock.type === 'span' &&
    startBlock.functionType === 'atxLine'
  ) {
    if (
      (start.offset === 0 && end.offset === startBlock.text.length) ||
      (start.offset === end.offset && start.offset === 1 && startBlock.text === '#')
    ) {
      event.preventDefault()
      startBlock.text = ''
      setCursor(contentState, start.key, 0)
      contentState.updateToParagraph(contentState.getParent(startBlock), startBlock)
      contentState.partialRender()
      return true
    }
  }

  return false
}

export const handleTokenBackspace = (contentState, event, startBlock, start, end) => {
  if (handleSpecialBackspaceToken(contentState, startBlock, start, end)) {
    event.preventDefault()
    return true
  }
  return false
}

export const handleTableSelectionBackspace = (contentState, event, startBlock, endBlock, startOutmostBlock, endOutmostBlock) => {
  const maybeCell = contentState.getParent(startBlock)
  const maybeLastRow = contentState.getParent(endBlock)
  if (/th/.test(maybeCell.type) && startOutmostBlock && startOutmostBlock === contentState.findOutMostBlock(startBlock) && contentState.cursor.start.offset === 0 && !maybeCell.preSibling) {
    if (
      (
        contentState.cursor.end.offset === endBlock.text.length &&
        startOutmostBlock === endOutmostBlock &&
        !endBlock.nextSibling && !maybeLastRow.nextSibling
      ) ||
      startOutmostBlock !== endOutmostBlock
    ) {
      event.preventDefault()
      const figureBlock = contentState.getBlock(contentState.closest(startBlock, 'figure'))
      const p = contentState.createBlockP(endBlock.text.substring(contentState.cursor.end.offset))
      contentState.insertBefore(p, figureBlock)
      const cursorBlock = p.children[0]
      if (startOutmostBlock !== endOutmostBlock) {
        contentState.removeBlocks(figureBlock, endBlock)
      }
      contentState.removeBlock(figureBlock)
      setCursor(contentState, cursorBlock.key, 0)
      contentState.render()
      return true
    }
  }

  return false
}

export const handleCellContentSelectionBackspace = (contentState, event, startBlock) => {
  if (
    startBlock.functionType === 'cellContent' &&
    contentState.cursor.start.offset === 0 &&
    contentState.cursor.end.offset !== 0 &&
    contentState.cursor.end.offset === startBlock.text.length
  ) {
    event.preventDefault()
    event.stopPropagation()
    startBlock.text = ''
    setCursor(contentState, startBlock.key, 0)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}

export const handleCodeContentBackspace = (contentState, event, startBlock, endBlock) => {
  if (
    startBlock.functionType === 'codeContent' &&
    startBlock.key === endBlock.key &&
    contentState.cursor.start.offset === contentState.cursor.end.offset &&
    (/\n.$/.test(startBlock.text) || startBlock.text === '\n') &&
    startBlock.text.length === contentState.cursor.start.offset
  ) {
    event.preventDefault()
    event.stopPropagation()
    startBlock.text = /\n.$/.test(startBlock.text) ? startBlock.text.replace(/.$/, '') : ''
    setCursor(contentState, startBlock.key, startBlock.text.length)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}

export const getBackspaceContext = contentState => {
  const node = selection.getSelectionStart()
  const parentNode = node && node.nodeType === 1 ? node.parentNode : null
  const paragraph = findNearestParagraph(node)
  const id = paragraph.id
  const block = contentState.getBlock(id)
  const parent = contentState.getBlock(block.parent)
  const preBlock = contentState.findPreBlockInLocation(block)
  const { left, right } = selection.getCaretOffsets(paragraph)
  const inlineDegrade = contentState.checkBackspaceCase()

  return {
    node,
    parentNode,
    paragraph,
    block,
    parent,
    preBlock,
    left,
    right,
    inlineDegrade
  }
}

export const handleTableCellStartBackspace = (contentState, event, block, preBlock, left) => {
  if (!(left === 0 && block.functionType === 'cellContent')) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  const table = contentState.closest(block, 'table')
  const figure = contentState.closest(table, 'figure')
  const hasContent = tableHasContent(table)
  let key
  let offset

  if ((!preBlock || preBlock.functionType !== 'cellContent') && !hasContent) {
    const paragraphContent = contentState.createBlock('span')
    delete figure.functionType
    figure.children = []
    contentState.appendChild(figure, paragraphContent)
    figure.text = ''
    figure.type = 'p'
    key = paragraphContent.key
    offset = 0
  } else if (preBlock) {
    key = preBlock.key
    offset = preBlock.text.length
  }

  if (key !== undefined && offset !== undefined) {
    setCursor(contentState, key, offset)
    contentState.partialRender()
  }

  return true
}
