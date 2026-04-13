import selection from '../selection'
import { resolveCursorRangeBlocks } from './cursorStateSupport'

export const docCutHandler = (contentState, event) => {
  if (!contentState.selectedTableCells) {
    return
  }

  event.preventDefault()
  return contentState.deleteSelectedTableCells(true)
}

export const cutHandler = contentState => {
  if (contentState.selectedTableCells) {
    return
  }

  const { selectedImage } = contentState
  if (selectedImage) {
    const { key, token } = selectedImage
    contentState.deleteImage({
      key,
      token
    })
    contentState.selectedImage = null
    return
  }

  const cursorContext = resolveCursorRangeBlocks(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return
  }

  const { start, end, startBlock, endBlock } = cursorContext
  startBlock.text = startBlock.text.substring(0, start.offset) + endBlock.text.substring(end.offset)
  if (start.key !== end.key) {
    contentState.removeBlocks(startBlock, endBlock)
  }
  contentState.cursor = {
    start,
    end: start
  }
  contentState.checkInlineUpdate(startBlock)
  contentState.partialRender()
}
