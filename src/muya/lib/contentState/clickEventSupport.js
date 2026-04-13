import selection from '../selection'
import { handleClickBelowLastParagraph, handleFrontMenuClick } from './clickParagraphSupport'
import { handleFormatClick } from './clickFormatSupport'
import { handleSelectionFormatPicker } from './clickSelectionSupport'

export const clickHandler = (contentState, event) => {
  if (handleClickBelowLastParagraph(contentState, event)) {
    return
  }

  if (handleFrontMenuClick(contentState, event)) {
    return
  }

  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }

  handleFormatClick(contentState, event)

  const block = contentState.getBlock(start.key)
  let needRender = false
  handleSelectionFormatPicker(contentState, block, start, end)

  if (block && start.key !== contentState.cursor.start.key) {
    const oldBlock = contentState.getBlock(contentState.cursor.start.key)
    if (oldBlock) {
      needRender = needRender || contentState.codeBlockUpdate(oldBlock)
    }
  }

  if (start.key !== contentState.cursor.start.key || end.key !== contentState.cursor.end.key) {
    needRender = true
  }

  const needMarkedUpdate = contentState.checkNeedRender(contentState.cursor) || contentState.checkNeedRender({ start, end })

  if (needRender) {
    contentState.cursor = { start, end }
    return contentState.partialRender()
  } else if (needMarkedUpdate) {
    requestAnimationFrame(() => {
      const cursor = selection.getCursorRange()
      if (!cursor.start || !cursor.end) {
        return
      }
      contentState.cursor = cursor
      return contentState.partialRender()
    })
  } else {
    contentState.cursor = { start, end }
  }
}
