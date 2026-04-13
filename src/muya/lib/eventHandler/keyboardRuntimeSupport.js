import { EVENT_KEYS } from '../config'
import selection from '../selection'
import {
  dispatchMuyaRuntimeEvent,
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter,
  triggerMuyaChange,
  triggerMuyaSelectionChange,
  triggerMuyaSelectionFormats
} from '../muyaRuntimeAccessSupport'
import { resolveActiveCursorRange } from '../contentState/cursorStateSupport'

export const listenKeyboardFloatState = keyboard => {
  keyboard.floatListener = (tool, status) => {
    status ? keyboard.shownFloat.add(tool) : keyboard.shownFloat.delete(tool)
    if (tool.name === 'ag-front-menu' && !status) {
      const container = getMuyaContainer(keyboard.muya)
      const contentState = getMuyaContentState(keyboard.muya)
      const seletedParagraph = container && container.querySelector('.ag-selected')
      if (seletedParagraph) {
        contentState.selectedBlock = null
        seletedParagraph.classList.toggle('ag-selected')
      }
    }
  }

  const eventCenter = getMuyaEventCenter(keyboard.muya)
  eventCenter && eventCenter.subscribe('muya-float', keyboard.floatListener)
}

export const hideKeyboardFloatTools = keyboard => {
  for (const tool of keyboard.shownFloat) {
    tool.hide()
  }
}

export const scheduleKeyboardInputChangeDispatch = (keyboard, delay = 60) => {
  if (keyboard.inputChangeTimer) {
    clearTimeout(keyboard.inputChangeTimer)
  }

  keyboard.inputChangeTimer = setTimeout(() => {
    triggerMuyaChange(keyboard.muya)
  }, delay)
}

export const bindKeyboardCompositionState = keyboard => {
  const container = getMuyaContainer(keyboard.muya)
  const eventCenter = getMuyaEventCenter(keyboard.muya)
  const contentState = getMuyaContentState(keyboard.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const handler = event => {
    if (event.type === 'compositionstart') {
      keyboard.isComposed = true
    } else if (event.type === 'compositionend') {
      keyboard.isComposed = false
      contentState.inputHandler(event)
      dispatchMuyaRuntimeEvent(keyboard.muya, 'stateChange')
    }
  }

  eventCenter.attachDOMEvent(container, 'compositionend', handler)
  eventCenter.attachDOMEvent(container, 'compositionstart', handler)
}

export const bindKeyboardEditorStateDispatch = keyboard => {
  const container = getMuyaContainer(keyboard.muya)
  const eventCenter = getMuyaEventCenter(keyboard.muya)
  if (!container || !eventCenter) {
    return
  }

  const changeHandler = event => {
    if (
      event.type === 'keyup' &&
      (event.key === EVENT_KEYS.ArrowUp || event.key === EVENT_KEYS.ArrowDown) &&
      keyboard.shownFloat.size > 0
    ) {
      return
    }

    if (event.target.closest('[contenteditable=false]')) {
      return
    }

    const contentState = getMuyaContentState(keyboard.muya)
    const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
    if (!cursorContext) {
      return
    }
    const { start, end } = cursorContext

    if (keyboard.editorStateTimer) clearTimeout(keyboard.editorStateTimer)
    keyboard.editorStateTimer = setTimeout(() => {
      triggerMuyaSelectionChange(keyboard.muya)
      triggerMuyaSelectionFormats(keyboard.muya)
      if (!keyboard.isComposed && event.type === 'click') {
        triggerMuyaChange(keyboard.muya)
      }
    })
  }

  eventCenter.attachDOMEvent(container, 'click', changeHandler)
  eventCenter.attachDOMEvent(container, 'keyup', changeHandler)
}
