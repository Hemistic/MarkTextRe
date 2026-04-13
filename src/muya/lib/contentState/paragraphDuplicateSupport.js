import { dispatchContentStateStateChange } from './runtimeEventSupport'

export const duplicateParagraph = contentState => {
  const { start, end } = contentState.cursor
  const startOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(start.key))
  const endOutmostBlock = contentState.findOutMostBlock(contentState.getBlock(end.key))
  if (startOutmostBlock !== endOutmostBlock) {
    return
  }

  const copiedBlock = contentState.copyBlock(startOutmostBlock)
  contentState.insertAfter(copiedBlock, startOutmostBlock)

  const cursorBlock = contentState.firstInDescendant(copiedBlock)
  const { key, text } = cursorBlock
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return dispatchContentStateStateChange(contentState)
}
