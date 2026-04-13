import selection from '../selection'

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

  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }

  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
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
