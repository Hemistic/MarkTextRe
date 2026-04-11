import { standardizeHTML, pasteImage } from './pasteSupport'
import { checkPasteType, checkCopyType, handleDocPaste, pasteHandler } from './pasteHandlerSupport'

const pasteCtrl = ContentState => {
  // check paste type: `MERGE` or `NEWLINE`
  ContentState.prototype.checkPasteType = function (start, fragment) {
    return checkPasteType(this, start, fragment)
  }

  // Try to identify the data type.
  ContentState.prototype.checkCopyType = function (html, rawText) {
    return checkCopyType(html, rawText)
  }

  ContentState.prototype.standardizeHTML = async function (rawHtml) {
    return standardizeHTML(this, rawHtml)
  }

  ContentState.prototype.pasteImage = async function (event) {
    return pasteImage(this, event)
  }

  // Handle global events.
  ContentState.prototype.docPasteHandler = async function (event) {
    return handleDocPaste(this, event)
  }

  // Handle `normal` and `pasteAsPlainText` paste for preview mode.
  ContentState.prototype.pasteHandler = async function (event, type = 'normal', rawText, rawHtml) {
    return pasteHandler(this, event, type, rawText, rawHtml)
  }
}

export default pasteCtrl
