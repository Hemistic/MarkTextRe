import selection from '../selection'
import { handleClickBelowLastParagraph, handleFrontMenuClick } from './clickParagraphSupport'
import { handleFormatClick } from './clickFormatSupport'
import { handleSelectionFormatPicker } from './clickSelectionSupport'
import { normalizeCursorRange, resolveActiveCursorRange } from './cursorStateSupport'

export const clickHandler = (contentState, event) => {
  if (handleClickBelowLastParagraph(contentState, event)) {
    return
  }

  if (handleFrontMenuClick(contentState, event)) {
    return
  }

  const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return
  }
  const normalizedCursor = normalizeCursorRange(cursorContext)
  if (!normalizedCursor) {
    return
  }
  const { start, end } = normalizedCursor
  const currentCursor = contentState.cursor || {}
  const currentStart = currentCursor.start || {}
  const currentEnd = currentCursor.end || {}

  handleFormatClick(contentState, event)

  const block = contentState.getBlock(start.key)
  let needRender = false
  handleSelectionFormatPicker(contentState, block, start, end)

  if (block && start.key !== currentStart.key) {
    const oldBlock = currentStart.key ? contentState.getBlock(currentStart.key) : null
    if (oldBlock) {
      needRender = needRender || contentState.codeBlockUpdate(oldBlock)
    }
  }

  if (start.key !== currentStart.key || end.key !== currentEnd.key) {
    needRender = true
  }

  const needMarkedUpdate = contentState.checkNeedRender(contentState.cursor) || contentState.checkNeedRender({ start, end })

  if (needRender) {
    contentState.cursor = normalizedCursor
    return contentState.partialRender()
  } else if (needMarkedUpdate) {
    requestAnimationFrame(() => {
      const nextCursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
      if (!nextCursorContext) {
        return
      }
      const nextCursor = normalizeCursorRange(nextCursorContext)
      if (!nextCursor) {
        return
      }
      contentState.cursor = nextCursor
      return contentState.partialRender()
    })
  } else {
    contentState.cursor = normalizedCursor
  }
}
