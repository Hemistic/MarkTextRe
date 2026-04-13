import selection from '../selection'
import { findNearestParagraph } from '../selection/dom'
import {
  getContentStateContainer,
  getContentStateEditor,
  getContentStateWindow
} from './runtimeDomSupport'

const focusEditor = editor => {
  if (!editor || typeof editor.focus !== 'function') {
    return false
  }

  try {
    editor.focus({ preventScroll: true })
    return true
  } catch (error) {
    try {
      editor.focus()
      return true
    } catch (focusError) {
      return false
    }
  }
}

const clampScrollTop = (container, value) => {
  if (!container || !Number.isFinite(value)) {
    return null
  }

  if (typeof container.scrollHeight === 'number' && typeof container.clientHeight === 'number') {
    return Math.max(0, Math.min(value, container.scrollHeight - container.clientHeight))
  }

  return Math.max(0, value)
}

const getCursorRect = () => {
  const range = typeof selection.getSelectionRange === 'function'
    ? selection.getSelectionRange()
    : null
  if (!range) {
    return null
  }

  if (typeof range.getClientRects === 'function') {
    const rects = range.getClientRects()
    if (rects && rects.length) {
      return rects[0]
    }
  }

  const startContainer = range.startContainer
  const isTextNode = startContainer && (
    (typeof Node !== 'undefined' && startContainer.nodeType === Node.TEXT_NODE) ||
    startContainer.nodeType === 3
  )
  const node = isTextNode
    ? startContainer.parentElement
    : startContainer
  const paragraph = findNearestParagraph(node)

  return paragraph ? paragraph.getBoundingClientRect() : null
}

export const preserveCursorScroll = (contentState, expectedScrollTop = null) => {
  const container = getContentStateContainer(contentState)
  if (!container) {
    return false
  }

  const containerRect = typeof container.getBoundingClientRect === 'function'
    ? container.getBoundingClientRect()
    : null
  const cursorRect = getCursorRect()

  if (!containerRect || !cursorRect) {
    return false
  }

  const padding = Math.max(2, Math.min(8, Math.round((cursorRect.height || 24) * 0.25)))
  const minTop = containerRect.top + padding
  const maxBottom = containerRect.bottom - padding
  let nextScrollTop = container.scrollTop

  if (cursorRect.top < minTop) {
    nextScrollTop -= minTop - cursorRect.top
  } else if (cursorRect.bottom > maxBottom) {
    nextScrollTop += cursorRect.bottom - maxBottom
  } else {
    return false
  }

  const safeScrollTop = clampScrollTop(container, nextScrollTop)
  if (safeScrollTop !== null && Math.abs(container.scrollTop - safeScrollTop) > 1) {
    container.scrollTop = safeScrollTop
  }

  return true
}

const restoreCursorRange = (contentState, expectedScrollTop = null) => {
  focusEditor(getContentStateEditor(contentState))
  const restored = selection.setCursorRange(contentState.cursor) !== false
  if (restored) {
    preserveCursorScroll(contentState, expectedScrollTop)
  }

  return restored
}

export const scheduleCursorRestore = (contentState, expectedScrollTop = null) => {
  const contentWindow = getContentStateWindow(contentState)
  const schedule = contentWindow && typeof contentWindow.requestAnimationFrame === 'function'
    ? contentWindow.requestAnimationFrame.bind(contentWindow)
    : callback => setTimeout(callback, 0)

  schedule(() => {
    restoreCursorRange(contentState, expectedScrollTop)
  })
}

export {
  focusEditor,
  restoreCursorRange
}
