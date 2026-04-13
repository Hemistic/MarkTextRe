import {
  appendHtmlAtCursor,
  handleCopyAsHtmlPaste
} from './pasteHtmlBlockSupport'
import {
  pasteIntoCodeContent,
  pasteIntoLanguageInput
} from './pasteCodeSupport'
import { pasteIntoTableCell } from './pasteTableSupport'

export const handleDirectPasteTarget = (contentState, type, text, copyType, startBlock, parent, start, end) => {
  const appendHtml = appendHtmlAtCursor.bind(null, contentState, startBlock, start)

  if (startBlock.type === 'span' && startBlock.functionType === 'languageInput') {
    pasteIntoLanguageInput(contentState, startBlock, start, end, text)
    return true
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'codeContent') {
    pasteIntoCodeContent(contentState, startBlock, start, end, text)
    return true
  }

  if (startBlock.functionType === 'cellContent' && pasteIntoTableCell(contentState, startBlock, start, end, text)) {
    return true
  }

  if (copyType === 'copyAsHtml') {
    handleCopyAsHtmlPaste(contentState, type, text, startBlock, parent, appendHtml)
    return true
  }

  return false
}
