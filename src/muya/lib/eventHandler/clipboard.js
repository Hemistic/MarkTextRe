import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaDocument,
  getMuyaEventCenter,
  triggerMuyaChange
} from '../muyaRuntimeAccessSupport'

class Clipboard {
  constructor (muya) {
    this.muya = muya
    this._copyType = 'normal' // `normal` or `copyAsMarkdown` or `copyAsHtml`
    this._pasteType = 'normal' // `normal` or `pasteAsPlainText`
    this._copyInfo = null
    this.listen()
  }

  listen () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    const doc = getMuyaDocument(this.muya)
    if (!container || !eventCenter || !contentState || !doc || !doc.body) {
      return
    }
    const docPasteHandler = event => {
      contentState.docPasteHandler(event)
    }
    const docCopyCutHandler = event => {
      contentState.docCopyHandler(event)
      if (event.type === 'cut') {
        // when user use `cut` function, the dom has been deleted by default.
        // But should update content state manually.
        contentState.docCutHandler(event)
      }
    }
    const copyCutHandler = event => {
      contentState.copyHandler(event, this._copyType, this._copyInfo)
      if (event.type === 'cut') {
        // when user use `cut` function, the dom has been deleted by default.
        // But should update content state manually.
        contentState.cutHandler()
      }
      this._copyType = 'normal'
    }
    const pasteHandler = event => {
      contentState.pasteHandler(event, this._pasteType)
      this._pasteType = 'normal'
      triggerMuyaChange(this.muya)
    }

    eventCenter.attachDOMEvent(doc, 'paste', docPasteHandler)
    eventCenter.attachDOMEvent(container, 'paste', pasteHandler)
    eventCenter.attachDOMEvent(container, 'cut', copyCutHandler)
    eventCenter.attachDOMEvent(container, 'copy', copyCutHandler)
    eventCenter.attachDOMEvent(doc.body, 'cut', docCopyCutHandler)
    eventCenter.attachDOMEvent(doc.body, 'copy', docCopyCutHandler)
  }

  // TODO: `document.execCommand` is deprecated!

  copyAsMarkdown () {
    this._copyType = 'copyAsMarkdown'
    const doc = getMuyaDocument(this.muya)
    doc && doc.execCommand('copy')
  }

  copyAsHtml () {
    this._copyType = 'copyAsHtml'
    const doc = getMuyaDocument(this.muya)
    doc && doc.execCommand('copy')
  }

  pasteAsPlainText () {
    this._pasteType = 'pasteAsPlainText'
    const doc = getMuyaDocument(this.muya)
    doc && doc.execCommand('paste')
  }

  /**
   * Copy the anchor block(table, paragraph, math block etc) with the info
   * @param {string|object} type copyBlock or copyCodeContent
   * @param {string|object} info  is the block key if it's string, or block if it's object
   */
  copy (type, info) {
    this._copyType = type
    this._copyInfo = info
    const doc = getMuyaDocument(this.muya)
    doc && doc.execCommand('copy')
  }
}

export default Clipboard
