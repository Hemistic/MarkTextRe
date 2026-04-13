import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

export const handleCellBoundaryBackspace = (contentState, event, startBlock, left, right) => {
  if (startBlock.functionType === 'cellContent' && /<br\/>.{1}$/.test(startBlock.text)) {
    event.preventDefault()
    event.stopPropagation()
    startBlock.text = startBlock.text.substring(0, startBlock.text.length - 1)
    setBackspaceCursor(contentState, startBlock.key, startBlock.text.length)
    contentState.singleRender(startBlock)
    return true
  }

  if (startBlock.functionType === 'cellContent' && left === 1 && right === 0) {
    event.stopPropagation()
    event.preventDefault()
    startBlock.text = ''
    setBackspaceCursor(contentState, startBlock.key, 0)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}
