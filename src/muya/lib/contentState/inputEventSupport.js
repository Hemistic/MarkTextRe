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
import {
  hasCursorEdgeKey,
  normalizeCursorRange,
  resolveActiveCursorRange
} from './cursorStateSupport'
import { tryHandleTrailingNewlineInsert } from './inputTrailingNewlineSupport'

export const inputHandler = (contentState, event, notEqual = false) => {
  const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return
  }

  const normalizedCursor = normalizeCursorRange(cursorContext)
  if (!normalizedCursor) {
    return
  }

  const { anchor, focus, start, end } = normalizedCursor
  const { startBlock: block } = cursorContext
  const { start: oldStart, end: oldEnd } = contentState.cursor || {}
  if (!hasCursorEdgeKey(oldStart) || !hasCursorEdgeKey(oldEnd)) {
    contentState.cursor = { anchor, focus, start, end }
    return
  }

  if (
    tryHandleTrailingNewlineInsert({
      contentState,
      block,
      cursor: normalizedCursor,
      event
    })
  ) {
    return inputHandler(contentState, event, true)
  }

  const key = start.key
  const paragraph = queryContentState(contentState, `#${key}`)

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

  contentState.cursor = { anchor, focus, start, end }

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
