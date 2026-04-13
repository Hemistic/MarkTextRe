
import selection from '../selection'
import { getImageInfo } from '../utils/getImageInfo'
import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

export const handleInlineImageBackspace = (contentState, event, context, startBlock, start) => {
  const { node, parentNode, right } = context
  if (parentNode && parentNode.classList && parentNode.classList.contains('ag-inline-image')) {
    if (selection.getCaretOffsets(node).left === 0) {
      event.preventDefault()
      event.stopPropagation()
      const imageInfo = getImageInfo(parentNode)
      contentState.deleteImage(imageInfo)
      return true
    }
    if (selection.getCaretOffsets(node).left === 1 && right === 0) {
      event.stopPropagation()
      event.preventDefault()
      const text = startBlock.text
      startBlock.text = text.substring(0, start.offset - 1) + text.substring(start.offset)
      setBackspaceCursor(contentState, startBlock.key, start.offset - 1)
      contentState.singleRender(startBlock)
      return true
    }
  }

  if (node && node.classList && node.classList.contains('ag-image-container')) {
    const imageWrapper = node.parentNode
    const imageInfo = getImageInfo(imageWrapper)
    if (start.offset === imageInfo.token.range.end) {
      event.preventDefault()
      event.stopPropagation()
      contentState.selectImage(imageInfo)
      return true
    }
  }

  return false
}
