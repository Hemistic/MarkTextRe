import { addFormat } from './formatTokenSupport'

export const formatMultiBlock = (contentState, type, startBlock, endBlock, start, end) => {
  let nextBlock = startBlock
  const formatType = type !== 'clear' ? type : undefined

  while (nextBlock && nextBlock !== endBlock) {
    contentState.clearBlockFormat(nextBlock, { start, end }, formatType)
    nextBlock = contentState.findNextBlockInLocation(nextBlock)
  }
  contentState.clearBlockFormat(endBlock, { start, end }, formatType)

  if (type !== 'clear') {
    addFormat(type, startBlock, {
      start,
      end: { offset: startBlock.text.length }
    })
    nextBlock = contentState.findNextBlockInLocation(startBlock)
    while (nextBlock && nextBlock !== endBlock) {
      addFormat(type, nextBlock, {
        start: { offset: 0 },
        end: { offset: nextBlock.text.length }
      })
      nextBlock = contentState.findNextBlockInLocation(nextBlock)
    }
    addFormat(type, endBlock, {
      start: { offset: 0 },
      end
    })
  }

  contentState.cursor = { start, end }
  contentState.partialRender()
}
