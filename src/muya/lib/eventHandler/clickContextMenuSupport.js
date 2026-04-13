import selection from '../selection'
import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter,
  getMuyaKeyboard
} from '../muyaRuntimeAccessSupport'

const runtimeGlobal = typeof globalThis !== 'undefined'
  ? globalThis
  : (typeof self !== 'undefined' ? self : null)

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

    const { start, end } = selection.getCursorRange()
    if (!start || !end) {
      return
    }

    const startBlock = contentState.getBlock(start.key)
    const nextTextBlock = contentState.findNextBlockInLocation(startBlock)
    if (
      nextTextBlock && nextTextBlock.key === end.key &&
      end.offset === 0 &&
      start.offset === startBlock.text.length
    ) {
      contentState.cursor = {
        start,
        end: start
      }
      selection.setCursorRange(contentState.cursor)
    } else {
      contentState.cursor = {
        start,
        end
      }
    }

    const sectionChanges = contentState.selectionChange(contentState.cursor)
    eventCenter.dispatch('contextmenu', event, sectionChanges)
  }

  eventCenter.attachDOMEvent(container, 'contextmenu', handler)
}
