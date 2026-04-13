import { hasTokenConflict } from './updateInlineTokenConflictSupport'
import { applyInlineUpdateRule } from './updateInlineRuleSupport'

export const checkNeedRender = (contentState, cursor = contentState.cursor) => {
  const { start: cStart, end: cEnd, anchor, focus } = cursor
  const startBlock = contentState.getBlock(cStart ? cStart.key : anchor.key)
  const endBlock = contentState.getBlock(cEnd ? cEnd.key : focus.key)
  const startOffset = cStart ? cStart.offset : anchor.offset
  const endOffset = cEnd ? cEnd.offset : focus.offset

  return hasTokenConflict(contentState, startBlock, startOffset) ||
    hasTokenConflict(contentState, endBlock, endOffset)
}

export const checkInlineUpdate = (contentState, block) => {
  return applyInlineUpdateRule(contentState, block)
}
