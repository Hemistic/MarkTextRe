
import { applyInlineDegrade } from './backspaceSupport'
import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

export const handleInlineDegradeBackspace = (contentState, event, block, parent, inlineDegrade) => {
  if (!inlineDegrade) {
    return false
  }

  event.preventDefault()
  applyInlineDegrade(contentState, block, parent, inlineDegrade)
  return true
}

export const handleMergeWithPreviousBackspace = (contentState, event, block, parent, preBlock, left) => {
  if (!(left === 0 && preBlock)) {
    return false
  }

  event.preventDefault()
  const { text } = block
  const key = preBlock.key
  const offset = preBlock.text.length
  preBlock.text += text

  if (contentState.isOnlyChild(block) && block.type === 'span') {
    contentState.removeBlock(parent)
  } else if (block.functionType !== 'languageInput' && block.functionType !== 'footnoteInput') {
    contentState.removeBlock(block)
  }

  setBackspaceCursor(contentState, key, offset)
  let needRenderAll = false
  if (contentState.isCollapse() && preBlock.type === 'span' && preBlock.functionType === 'paragraphContent') {
    contentState.checkInlineUpdate(preBlock)
    needRenderAll = true
  }

  needRenderAll ? contentState.render() : contentState.partialRender()
  return true
}
