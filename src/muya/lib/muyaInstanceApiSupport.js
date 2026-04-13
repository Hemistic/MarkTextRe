import {
  calculateMuyaWordCount,
  destroyMuya,
  getMuyaCursor,
  getMuyaMarkdown,
  initializeMuya,
  setMuyaMarkdown,
  setMuyaFocusMode,
  setMuyaFont,
  setMuyaListIndentation,
  setMuyaTabSize
} from './muyaRuntimeSupport'
import {
  exportHtml as exportMuyaHtml,
  exportStyledHTML as exportMuyaStyledHTML,
  extractImages as extractMuyaImagesFromApi,
  setCursor as setMuyaCursor
} from './muyaDocumentApiSupport'
import {
  blur as blurMuya,
  createTable as createMuyaTable,
  deleteParagraph as deleteMuyaParagraph,
  duplicate as duplicateMuyaParagraph,
  editTable as editMuyaTable,
  find as findMuyaText,
  focus as focusMuya,
  format as formatMuya,
  getSelection as getMuyaSelection,
  hasFocus as hasMuyaFocus,
  hideAllFloatTools as hideMuyaFloatTools,
  insertImage as insertMuyaImage,
  insertParagraph as insertMuyaParagraph,
  replace as replaceMuyaText,
  replaceCurrentWordInlineUnsafe as replaceCurrentMuyaWordInlineUnsafe,
  replaceWordInline as replaceMuyaWordInline,
  search as searchMuyaText,
  setOptions as setMuyaEditorOptions,
  updateParagraph as updateMuyaParagraph
} from './muyaCommandApiSupport'
import {
  copy as copyMuyaSelection,
  copyAsHtml as copyMuyaAsHtml,
  copyAsMarkdown as copyMuyaAsMarkdown,
  pasteAsPlainText as pasteMuyaAsPlainText
} from './muyaClipboardApiSupport'
import {
  invalidateImageCache as invalidateMuyaImageCache,
  redo as redoMuyaHistory,
  selectAll as selectAllMuyaContent,
  undo as undoMuyaHistory
} from './muyaHistoryApiSupport'

export const applyMuyaInstanceApi = Muya => {
  Object.assign(Muya.prototype, {
    init () {
      return initializeMuya(this)
    },

    getMarkdown () {
      return getMuyaMarkdown(this)
    },

    getHistory () {
      return this.contentState.getHistory()
    },

    getTOC () {
      return this.contentState.getTOC()
    },

    setHistory (history) {
      return this.contentState.setHistory(history)
    },

    clearHistory () {
      return this.contentState.history.clearHistory()
    },

    async exportStyledHTML (options) {
      return exportMuyaStyledHTML(this, options)
    },

    async exportHtml () {
      return exportMuyaHtml(this)
    },

    getWordCount (markdown) {
      return calculateMuyaWordCount(markdown)
    },

    getCursor () {
      return getMuyaCursor(this)
    },

    setMarkdown (markdown, cursor, isRenderCursor = true) {
      return setMuyaMarkdown(this, markdown, cursor, isRenderCursor)
    },

    setCursor (cursor) {
      return setMuyaCursor(this, cursor)
    },

    createTable (tableChecker) {
      return createMuyaTable(this, tableChecker)
    },

    getSelection () {
      return getMuyaSelection(this)
    },

    setFocusMode (bool) {
      return setMuyaFocusMode(this, bool)
    },

    setFont ({ fontSize, lineHeight }) {
      return setMuyaFont(this, { fontSize, lineHeight })
    },

    setTabSize (tabSize) {
      return setMuyaTabSize(this, tabSize)
    },

    setListIndentation (listIndentation) {
      return setMuyaListIndentation(this, listIndentation)
    },

    updateParagraph (type) {
      updateMuyaParagraph(this, type)
    },

    duplicate () {
      duplicateMuyaParagraph(this)
    },

    deleteParagraph () {
      deleteMuyaParagraph(this)
    },

    insertParagraph (location, text = '', outMost = false) {
      insertMuyaParagraph(this, location, text, outMost)
    },

    editTable (data) {
      editMuyaTable(this, data)
    },

    hasFocus () {
      return hasMuyaFocus(this)
    },

    focus () {
      focusMuya(this)
    },

    blur (isRemoveAllRange = false, unSelect = false) {
      blurMuya(this, isRemoveAllRange, unSelect)
    },

    format (type) {
      formatMuya(this, type)
    },

    insertImage (imageInfo) {
      insertMuyaImage(this, imageInfo)
    },

    search (value, opt) {
      return searchMuyaText(this, value, opt)
    },

    replace (value, opt) {
      return replaceMuyaText(this, value, opt)
    },

    find (action) {
      return findMuyaText(this, action)
    },

    on (event, listener) {
      this.eventCenter.subscribe(event, listener)
    },

    off (event, listener) {
      this.eventCenter.unsubscribe(event, listener)
    },

    once (event, listener) {
      this.eventCenter.subscribeOnce(event, listener)
    },

    invalidateImageCache () {
      invalidateMuyaImageCache(this)
    },

    undo () {
      undoMuyaHistory(this)
    },

    redo () {
      redoMuyaHistory(this)
    },

    selectAll () {
      selectAllMuyaContent(this)
    },

    extractImages (markdown = this.markdown) {
      return extractMuyaImagesFromApi(this, markdown)
    },

    copyAsMarkdown () {
      copyMuyaAsMarkdown(this)
    },

    copyAsHtml () {
      copyMuyaAsHtml(this)
    },

    pasteAsPlainText () {
      pasteMuyaAsPlainText(this)
    },

    copy (info) {
      return copyMuyaSelection(this, info)
    },

    setOptions (options, needRender = false) {
      return setMuyaEditorOptions(this, options, needRender)
    },

    hideAllFloatTools () {
      return hideMuyaFloatTools(this)
    },

    replaceWordInline (line, wordCursor, replacement, setCursor = false) {
      replaceMuyaWordInline(this, line, wordCursor, replacement, setCursor)
    },

    _replaceCurrentWordInlineUnsafe (word, replacement) {
      return replaceCurrentMuyaWordInlineUnsafe(this, word, replacement)
    },

    destroy () {
      destroyMuya(this)
    }
  })
}
