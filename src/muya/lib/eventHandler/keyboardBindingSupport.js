import { EVENT_KEYS } from '../config'
import selection from '../selection'
import { findNearestParagraph } from '../selection/dom'
import { getParagraphReference, getImageInfo } from '../utils'
import { checkEditEmoji } from '../ui/emojis/checkSupport'
import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaDocument,
  getMuyaEventCenter,
  triggerMuyaChange
} from '../muyaRuntimeAccessSupport'
import { scheduleKeyboardInputChangeDispatch } from './keyboardRuntimeSupport'

const shouldPreventKeyboardFloatDefault = keyboard => {
  for (const tool of keyboard.shownFloat) {
    if (
      tool.name === 'ag-format-picker' ||
      tool.name === 'ag-table-picker' ||
      tool.name === 'ag-quick-insert' ||
      tool.name === 'ag-emoji-picker' ||
      tool.name === 'ag-front-menu' ||
      tool.name === 'ag-list-picker' ||
      tool.name === 'ag-image-selector'
    ) {
      return true
    }
  }

  return false
}

export const bindKeyboardKeydown = keyboard => {
  const container = getMuyaContainer(keyboard.muya)
  const eventCenter = getMuyaEventCenter(keyboard.muya)
  const contentState = getMuyaContentState(keyboard.muya)
  const doc = getMuyaDocument(keyboard.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const docHandler = event => {
    switch (event.code) {
      case EVENT_KEYS.Enter:
        return contentState.docEnterHandler(event)
      case EVENT_KEYS.Space: {
        if (contentState.selectedImage) {
          const { token } = contentState.selectedImage
          const { src } = getImageInfo(token.src || token.attrs.src)
          if (src) {
            eventCenter.dispatch('preview-image', {
              data: src
            })
          }
        }
        break
      }
      case EVENT_KEYS.Backspace:
        return contentState.docBackspaceHandler(event)
      case EVENT_KEYS.Delete:
        return contentState.docDeleteHandler(event)
      case EVENT_KEYS.ArrowUp:
      case EVENT_KEYS.ArrowDown:
      case EVENT_KEYS.ArrowLeft:
      case EVENT_KEYS.ArrowRight:
        return contentState.docArrowHandler(event)
    }
  }

  const handler = event => {
    if (event.metaKey || event.ctrlKey) {
      container.classList.add('ag-meta-or-ctrl')
    }

    if (
      keyboard.shownFloat.size > 0 &&
      (
        event.key === EVENT_KEYS.Enter ||
        event.key === EVENT_KEYS.Escape ||
        event.key === EVENT_KEYS.Tab ||
        event.key === EVENT_KEYS.ArrowUp ||
        event.key === EVENT_KEYS.ArrowDown
      )
    ) {
      if (shouldPreventKeyboardFloatDefault(keyboard)) {
        event.preventDefault()
      }
      return
    }

    switch (event.key) {
      case EVENT_KEYS.Backspace:
        contentState.backspaceHandler(event)
        break
      case EVENT_KEYS.Delete:
        contentState.deleteHandler(event)
        break
      case EVENT_KEYS.Enter:
        if (!keyboard.isComposed) {
          contentState.enterHandler(event)
          triggerMuyaChange(keyboard.muya)
        }
        break
      case EVENT_KEYS.ArrowUp:
      case EVENT_KEYS.ArrowDown:
      case EVENT_KEYS.ArrowLeft:
      case EVENT_KEYS.ArrowRight:
        if (!keyboard.isComposed) {
          contentState.arrowHandler(event)
        }
        break
      case EVENT_KEYS.Tab:
        contentState.tabHandler(event)
        break
      default:
        break
    }
  }

  eventCenter.attachDOMEvent(container, 'keydown', handler)
  if (doc) {
    eventCenter.attachDOMEvent(doc, 'keydown', docHandler)
  }
}

export const bindKeyboardInput = keyboard => {
  const container = getMuyaContainer(keyboard.muya)
  const eventCenter = getMuyaEventCenter(keyboard.muya)
  const contentState = getMuyaContentState(keyboard.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const inputHandler = event => {
    if (!keyboard.isComposed) {
      contentState.inputHandler(event)
      const delay = event.target.closest('.ag-code-content') ? 120 : 40
      scheduleKeyboardInputChangeDispatch(keyboard, delay)
    }

    const { lang, paragraph } = contentState.checkEditLanguage()
    if (lang) {
      eventCenter.dispatch('muya-code-picker', {
        reference: getParagraphReference(paragraph, paragraph.id),
        lang,
        cb: item => {
          contentState.selectLanguage(paragraph, item.name)
        }
      })
    } else {
      eventCenter.dispatch('muya-code-picker', { reference: null })
    }
  }

  eventCenter.attachDOMEvent(container, 'input', inputHandler)
}

export const bindKeyboardKeyup = keyboard => {
  const container = getMuyaContainer(keyboard.muya)
  const eventCenter = getMuyaEventCenter(keyboard.muya)
  const contentState = getMuyaContentState(keyboard.muya)
  if (!container || !eventCenter || !contentState) {
    return
  }

  const handler = event => {
    container.classList.remove('ag-meta-or-ctrl')
    const node = selection.getSelectionStart()
    const paragraph = findNearestParagraph(node)
    const emojiNode = checkEditEmoji(node)
    contentState.selectedImage = null
    if (
      paragraph &&
      emojiNode &&
      event.key !== EVENT_KEYS.Enter &&
      event.key !== EVENT_KEYS.ArrowDown &&
      event.key !== EVENT_KEYS.ArrowUp &&
      event.key !== EVENT_KEYS.Tab &&
      event.key !== EVENT_KEYS.Escape
    ) {
      const reference = getParagraphReference(emojiNode, paragraph.id)
      eventCenter.dispatch('muya-emoji-picker', {
        reference,
        emojiNode
      })
    }
    if (!emojiNode) {
      eventCenter.dispatch('muya-emoji-picker', {
        emojiNode
      })
    }

    const { anchor, focus, start, end } = selection.getCursorRange()
    if (!anchor || !focus) {
      return
    }
    if (
      !keyboard.isComposed &&
      event.key !== EVENT_KEYS.Enter &&
      event.key !== EVENT_KEYS.Backspace &&
      event.key !== EVENT_KEYS.Delete
    ) {
      const { anchor: oldAnchor, focus: oldFocus } = contentState.cursor
      if (
        anchor.key !== oldAnchor.key ||
        anchor.offset !== oldAnchor.offset ||
        focus.key !== oldFocus.key ||
        focus.offset !== oldFocus.offset
      ) {
        const needRender = contentState.checkNeedRender(contentState.cursor) || contentState.checkNeedRender({ start, end })
        contentState.cursor = { anchor, focus }
        if (needRender) {
          return contentState.partialRender()
        }
      }
    }

    const block = contentState.getBlock(anchor.key)
    if (!block) {
      eventCenter.dispatch('muya-format-picker', { reference: null })
      return
    }

    if (
      anchor.key === focus.key &&
      anchor.offset !== focus.offset &&
      block.functionType !== 'codeContent' &&
      block.functionType !== 'languageInput'
    ) {
      const reference = contentState.getPositionReference()
      const { formats } = contentState.selectionFormats()
      eventCenter.dispatch('muya-format-picker', { reference, formats })
    } else {
      eventCenter.dispatch('muya-format-picker', { reference: null })
    }
  }

  eventCenter.attachDOMEvent(container, 'keyup', handler)
}
