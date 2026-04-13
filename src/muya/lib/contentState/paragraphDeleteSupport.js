import { dispatchContentStateStateChange } from './runtimeEventSupport'

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
  return dispatchContentStateStateChange(contentState)
}
