import selection from '../selection'
import { findNearestParagraph } from '../selection/dom'
import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter,
  getMuyaKeyboard
} from '../muyaRuntimeAccessSupport'
import { resolveEnterCursorTarget } from '../contentState/enterCodeBlockCursorSupport'
import { resolveActiveCursorRange } from '../contentState/cursorStateSupport'

const runtimeGlobal = typeof globalThis !== 'undefined'
  ? globalThis
  : (typeof self !== 'undefined' ? self : null)

const resolveTargetParagraphCursor = (contentState, target) => {
  const paragraph = findNearestParagraph(target)
  if (!paragraph) {
    return null
  }

  const block = contentState.getBlock(paragraph.id)
  const targetBlock = resolveEnterCursorTarget(block)
  if (!targetBlock || !targetBlock.key) {
    return null
  }

  return {
    start: { key: targetBlock.key, offset: 0 },
    end: { key: targetBlock.key, offset: 0 }
  }
}

export const bindClickContextMenu = clickEvent => {
  const container = getMuyaContainer(clickEvent.muya)
  const eventCenter = getMuyaEventCenter(clickEvent.muya)
  const contentState = getMuyaContentState(clickEvent.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const handler = event => {
    if (!runtimeGlobal || !runtimeGlobal.marktext) {
      event.preventDefault()
      event.stopPropagation()
    }

    const keyboard = getMuyaKeyboard(clickEvent.muya)
    if (keyboard) {
      keyboard.hideAllFloatTools()
    }

    const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
    const fallbackCursor = resolveTargetParagraphCursor(contentState, event.target)
    if (!cursorContext && !fallbackCursor) {
      return
    }
    const { start, end } = cursorContext || fallbackCursor

    const startBlock = contentState.getBlock(start.key)
    if (!startBlock) {
      return
    }

    const nextTextBlock = contentState.findNextBlockInLocation(startBlock)
    const selectionCursor = {
      start,
      end
    }
    if (
      nextTextBlock && nextTextBlock.key === end.key &&
      end.offset === 0 &&
      start.offset === startBlock.text.length
    ) {
      const collapsedCursor = {
        start,
        end: start
      }
      contentState.cursor = collapsedCursor
      if (selection.setCursorRange(collapsedCursor) === false) {
        contentState.cursor = selectionCursor
      }
    } else {
      contentState.cursor = selectionCursor
    }

    const sectionChanges = contentState.selectionChange(contentState.cursor)
    eventCenter.dispatch('contextmenu', event, sectionChanges)
  }

  eventCenter.attachDOMEvent(container, 'contextmenu', handler)
}
