
import { splitBlockEdge } from './enterBlockEdgeSplitSupport'
import { splitBlockMiddle } from './enterBlockMiddleSplitSupport'

export const splitBlockOnEnter = (contentState, context, start) => {
  const { block, paragraph, text, left, right, type } = context
  let newBlock

  switch (true) {
    case left !== 0 && right !== 0:
      newBlock = splitBlockMiddle(contentState, context, start)
      break
    case left === 0 && right === 0:
    case left !== 0 && right === 0:
    case left === 0 && right !== 0:
      newBlock = splitBlockEdge(contentState, context, block, left, right, type)
      if (left === 0 && right === 0) {
        return null
      }
      break
    default:
      newBlock = contentState.createBlockP()
      contentState.insertAfter(newBlock, block)
      break
  }

  return newBlock
}
