import { EVENT_KEYS } from '../config'

const adjustOffset = (offset, block, event) => {
  if (/^span$/.test(block.type) && block.functionType === 'atxLine' && event.key === EVENT_KEYS.ArrowDown) {
    const match = /^\s{0,3}(?:#{1,6})(?:\s{1,}|$)/.exec(block.text)
    if (match) {
      return match[0].length
    }
  }
  return offset
}

export const moveToPreviousBlock = (contentState, event, preBlock) => {
  event.preventDefault()
  event.stopPropagation()
  if (!preBlock) return true
  const key = preBlock.key
  const offset = preBlock.text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

export const moveToNextBlock = (contentState, event, nextBlock) => {
  event.preventDefault()
  event.stopPropagation()
  let key
  let newBlock
  if (nextBlock) {
    key = nextBlock.key
  } else {
    newBlock = contentState.createBlockP()
    const lastBlock = contentState.blocks[contentState.blocks.length - 1]
    contentState.insertAfter(newBlock, lastBlock)
    key = newBlock.children[0].key
  }
  const offset = adjustOffset(0, nextBlock || newBlock, event)
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

export const adjustArrowOffset = adjustOffset
