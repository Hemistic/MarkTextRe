import { handleSpecialBackspaceToken } from './backspaceSupport'
import { setBackspaceCursor } from './backspaceDocSupport'

export const handleAtxHeadingBackspace = (contentState, event, start, end, startBlock) => {
  if (!startBlock) {
    return false
  }

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
      setBackspaceCursor(contentState, start.key, 0)
      contentState.updateToParagraph(contentState.getParent(startBlock), startBlock)
      contentState.partialRender()
      return true
    }
  }

  return false
}

export const handleTokenBackspace = (contentState, event, startBlock, start, end) => {
  if (!startBlock) {
    return false
  }

  if (handleSpecialBackspaceToken(contentState, startBlock, start, end)) {
    event.preventDefault()
    return true
  }
  return false
}

export const handleCellContentSelectionBackspace = (contentState, event, startBlock) => {
  if (!startBlock) {
    return false
  }

  if (
    startBlock.functionType === 'cellContent' &&
    contentState.cursor.start.offset === 0 &&
    contentState.cursor.end.offset !== 0 &&
    contentState.cursor.end.offset === startBlock.text.length
  ) {
    event.preventDefault()
    event.stopPropagation()
    startBlock.text = ''
    setBackspaceCursor(contentState, startBlock.key, 0)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}

export const handleCodeContentBackspace = (contentState, event, startBlock, endBlock) => {
  if (!startBlock || !endBlock) {
    return false
  }

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
    setBackspaceCursor(contentState, startBlock.key, startBlock.text.length)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}
