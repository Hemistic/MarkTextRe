import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

export const handleFootnoteBackspace = (contentState, event, block, parent, preBlock, left) => {
  if (
    block.type === 'span' &&
    block.functionType === 'paragraphContent' &&
    left === 0 &&
    preBlock &&
    preBlock.functionType === 'footnoteInput'
  ) {
    event.preventDefault()
    event.stopPropagation()
    if (!parent.nextSibling) {
      const pBlock = contentState.createBlockP(block.text)
      const figureBlock = contentState.closest(block, 'figure')
      contentState.insertBefore(pBlock, figureBlock)
      contentState.removeBlock(figureBlock)
      setBackspaceCursor(contentState, pBlock.children[0].key, 0)
      contentState.partialRender()
    }
    return true
  }

  return false
}
