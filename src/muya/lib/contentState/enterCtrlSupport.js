import {
  handleFootnoteEnter,
  handleShiftEnter,
  handleTableEnter,
  prepareEnterBlock,
  splitBlockOnEnter,
  finalizeEnter
} from './enterHandlerSupport'

export const resolveEnterCursorBlock = (contentState, start) => {
  if (!start || !start.key) {
    return null
  }
  return contentState.getBlock(start.key)
}

export const handleEnterPreSplitStage = (contentState, event, block, start, footnoteReg, isOsx, getFirstBlockInNextRow) => {
  if (!block) {
    return false
  }

  if (handleFootnoteEnter(contentState, event, block, start, footnoteReg)) {
    return true
  }

  if (handleShiftEnter(contentState, event, block, start)) {
    return true
  }

  if (handleTableEnter(contentState, event, block, isOsx, getFirstBlockInNextRow)) {
    return true
  }

  return false
}

export const splitAndFinalizeEnterBlock = (contentState, block, start, getParagraphBlock) => {
  const context = prepareEnterBlock(contentState, block, start)
  if (!context || !context.block) {
    return false
  }

  const targetBlock = context.block
  const newBlock = splitBlockOnEnter(contentState, context, start)
  if (!targetBlock || !newBlock) {
    return false
  }

  finalizeEnter(contentState, targetBlock, newBlock, getParagraphBlock)
  return true
}
