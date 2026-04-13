export const selectImage = (contentState, imageInfo) => {
  contentState.selectedImage = imageInfo
  const { key } = imageInfo
  const block = contentState.getBlock(key)
  const outMostBlock = contentState.findOutMostBlock(block)
  contentState.cursor = {
    start: { key, offset: imageInfo.token.range.end },
    end: { key, offset: imageInfo.token.range.end }
  }
  const { start } = contentState.prevCursor
  const oldBlock = contentState.findOutMostBlock(contentState.getBlock(start.key))
  if (oldBlock.key !== outMostBlock.key) {
    contentState.singleRender(oldBlock, false)
  }

  return contentState.singleRender(outMostBlock, true)
}
