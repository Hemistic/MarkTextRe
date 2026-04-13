import {
  handleContentStateDocPaste,
  handleContentStatePaste,
  pasteContentStateImage,
  standardizeContentStateHTML
} from './pasteRuntimeLoaderSupport'
import { checkCopyType, checkPasteType } from './pasteClassifierSupport'

const pasteCtrl = ContentState => {
  // check paste type: `MERGE` or `NEWLINE`
  ContentState.prototype.checkPasteType = function (start, fragment) {
    return checkPasteType(this, start, fragment)
  }

  // Try to identify the data type.
  ContentState.prototype.checkCopyType = function (html, rawText) {
    return checkCopyType(this, html, rawText)
  }

  ContentState.prototype.standardizeHTML = async function (rawHtml) {
    return standardizeContentStateHTML(this, rawHtml)
  }

  ContentState.prototype.pasteImage = async function (event) {
    return pasteContentStateImage(this, event)
  }

  // Handle global events.
  ContentState.prototype.docPasteHandler = async function (event) {
    return handleContentStateDocPaste(this, event)
  }

  // Handle `normal` and `pasteAsPlainText` paste for preview mode.
  ContentState.prototype.pasteHandler = async function (event, type = 'normal', rawText, rawHtml) {
    return handleContentStatePaste(this, event, type, rawText, rawHtml)
  }
}

export default pasteCtrl
