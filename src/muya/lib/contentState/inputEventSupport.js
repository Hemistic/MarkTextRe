import selection from '../selection'
import {
  collectInputText,
  applyAutoPair
} from './inputSupport'
import { applyInputSelectionMutation } from './inputSelectionMutationSupport'
import {
  dispatchQuickInsert,
  renderCodeBlockNow,
  resolveInputRenderState,
  scheduleCodeBlockRender
} from './inputRenderSupport'
import { queryContentState } from './runtimeDomSupport'

export const inputHandler = (contentState, event, notEqual = false) => {
  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }

  const { start: oldStart, end: oldEnd } = contentState.cursor
  const key = start.key
  const block = contentState.getBlock(key)
  const paragraph = queryContentState(contentState, `#${key}`)

  if (
    oldStart.key === oldEnd.key &&
    oldStart.offset === oldEnd.offset &&
    block.text.endsWith('\n') &&
    oldStart.offset === block.text.length &&
    event.inputType === 'insertText'
  ) {
    event.preventDefault()
    block.text += event.data
    const offset = block.text.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.singleRender(block)
    return inputHandler(contentState, event, true)
  }

  if (!paragraph) {
    return
  }

  let text = collectInputText(paragraph)

  let needRender = false
  let needRenderAll = false
  if (oldStart.key !== oldEnd.key) {
    const selectionMutation = applyInputSelectionMutation(
      contentState,
      start,
      end,
      oldStart,
      oldEnd,
      text
    )
    text = selectionMutation.text
    needRender = selectionMutation.needRender
    needRenderAll = selectionMutation.needRenderAll
  }

  if (block && (block.text !== text || notEqual)) {
    const autoPairResult = applyAutoPair(contentState, block, text, start, end, oldStart, event)
    needRender = needRender || autoPairResult.needRender
    needRenderAll = needRenderAll || autoPairResult.needRenderAll
  }

  dispatchQuickInsert(contentState, paragraph, block)

  contentState.cursor = { start, end }

  if (block && block.type === 'span' && block.functionType === 'codeContent') {
    const hasTokenMarkup = !!paragraph?.querySelector?.('.token')

    if (needRender || hasTokenMarkup) {
      renderCodeBlockNow(contentState, block)
      return
    }

    scheduleCodeBlockRender(contentState, block, false)
    return
  }

  return resolveInputRenderState(contentState, block, needRender, needRenderAll)
}
