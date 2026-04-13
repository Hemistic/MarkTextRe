import { EVENT_KEYS } from '../config'
import { findNextRowCell, findPrevRowCell } from './arrowTableSupport'
import { adjustArrowOffset } from './arrowCursorMoveSupport'

export const moveBetweenTableCells = (contentState, event, block) => {
  if (block.functionType !== 'cellContent') {
    return false
  }

  let activeBlock
  const cellInNextRow = findNextRowCell(contentState, block)
  const cellInPrevRow = findPrevRowCell(contentState, block)

  if (event.key === EVENT_KEYS.ArrowUp) {
    activeBlock = cellInPrevRow || contentState.findPreBlockInLocation(contentState.getTableBlock())
  }

  if (event.key === EVENT_KEYS.ArrowDown) {
    activeBlock = cellInNextRow || contentState.findNextBlockInLocation(contentState.getTableBlock())
  }

  if (!activeBlock) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  let offset = activeBlock.type === 'p'
    ? 0
    : (event.key === EVENT_KEYS.ArrowUp ? activeBlock.text.length : 0)
  offset = adjustArrowOffset(offset, activeBlock, event)

  const key = activeBlock.type === 'p' ? activeBlock.children[0].key : activeBlock.key
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}
