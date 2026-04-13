import { getContentStateClipboardData } from './copyCutClipboardSupport'
import {
  handleCopyAsHtml,
  handleCopyBlock,
  handleCopyCodeContent
} from './copyCutModeSupport'
import { copySelectedTable } from './copyCutTableSupport'

export const docCopyHandler = (contentState, event) => {
  return copySelectedTable(contentState, event)
}

export const copyHandler = (contentState, event, type, copyInfo = null) => {
  if (contentState.selectedTableCells) {
    return
  }

  event.preventDefault()
  const { selectedImage } = contentState
  if (selectedImage) {
    const { token } = selectedImage
    if (token.raw.length > 0) {
      event.clipboardData.setData('text/html', token.raw)
      event.clipboardData.setData('text/plain', token.raw)
    }
    return
  }

  const { html, text } = getContentStateClipboardData(contentState)
  switch (type) {
    case 'normal':
      if (text.length > 0) {
        event.clipboardData.setData('text/html', html)
        event.clipboardData.setData('text/plain', text)
      }
      break
    case 'copyAsMarkdown':
      if (text.length > 0) {
        event.clipboardData.setData('text/html', '')
        event.clipboardData.setData('text/plain', text)
      }
      break
    case 'copyAsHtml':
      handleCopyAsHtml(contentState, event, text)
      break
    case 'copyBlock':
      handleCopyBlock(contentState, event, copyInfo)
      break
    case 'copyCodeContent':
      handleCopyCodeContent(event, copyInfo)
      break
  }
}
