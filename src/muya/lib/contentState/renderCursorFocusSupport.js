import selection from '../selection'
import {
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

export const scheduleCursorRestore = contentState => {
  const contentWindow = getContentStateWindow(contentState)
  const schedule = contentWindow && typeof contentWindow.requestAnimationFrame === 'function'
    ? contentWindow.requestAnimationFrame.bind(contentWindow)
    : callback => setTimeout(callback, 0)

  schedule(() => {
    focusEditor(getContentStateEditor(contentState))
    selection.setCursorRange(contentState.cursor)
  })
}

export { focusEditor }
