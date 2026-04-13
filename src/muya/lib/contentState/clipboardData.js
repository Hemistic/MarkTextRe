import selection from '../selection'
import {
  getCodeSelectionClipboardData,
  getSelectionClipboardData
} from './clipboardSelectionSupport'

export const getClipboardData = contentState => {
  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return { html: '', text: '' }
  }

  const codeSelectionData = getCodeSelectionClipboardData(contentState, start, end)
  if (codeSelectionData) {
    return codeSelectionData
  }

  return getSelectionClipboardData(contentState)
}
