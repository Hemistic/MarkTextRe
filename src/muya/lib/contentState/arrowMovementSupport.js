import { EVENT_KEYS } from '../config'
import { findNearestParagraph } from '../selection/dom'
import selection from '../selection'
import {
  handleMathArrowRight,
  shouldIgnoreArrow,
  canKeepNativeVerticalArrow
} from './arrowSelectionSupport'
import { moveBetweenTableCells } from './arrowTableMoveSupport'
import {
  moveToNextBlock,
  moveToPreviousBlock
} from './arrowCursorMoveSupport'
import { resolveActiveCursorRange } from './cursorStateSupport'

export const arrowHandler = (contentState, event) => {
  const node = selection.getSelectionStart()
  const paragraph = findNearestParagraph(node)
  if (!paragraph) {
    return
  }

  const block = contentState.getBlock(paragraph.id)
  if (!block) {
    return
  }

  const preBlock = contentState.findPreBlockInLocation(block)
  const nextBlock = contentState.findNextBlockInLocation(block)
  const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return
  }

  const { start, end } = cursorContext
  const { topOffset, bottomOffset } = selection.getCursorYOffset(paragraph)

  if (handleMathArrowRight(event, node, start, end)) {
    return
  }

  if (shouldIgnoreArrow(event, start, end)) {
    return
  }

  if (canKeepNativeVerticalArrow(event, block, topOffset, bottomOffset)) {
    return
  }

  if (moveBetweenTableCells(contentState, event, block)) {
    return
  }

  if (
    event.key === EVENT_KEYS.ArrowUp ||
    (event.key === EVENT_KEYS.ArrowLeft && start.offset === 0)
  ) {
    return moveToPreviousBlock(contentState, event, preBlock)
  } else if (
    event.key === EVENT_KEYS.ArrowDown ||
    (event.key === EVENT_KEYS.ArrowRight && start.offset === block.text.length)
  ) {
    return moveToNextBlock(contentState, event, nextBlock)
  }
}
