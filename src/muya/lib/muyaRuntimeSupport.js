export {
  attachMuyaPlugins,
  destroyMuya,
  initializeMuya,
  initializeMuyaRuntime
} from './muyaLifecycleSupport'
export {
  calculateMuyaWordCount,
  extractMuyaImages,
  getMuyaCursor,
  getMuyaMarkdown,
  loadMuyaExportHtml,
  setMuyaMarkdown
} from './muyaDocumentSupport'
export {
  setMuyaFocusMode,
  setMuyaFont,
  setMuyaListIndentation,
  setMuyaOptions,
  setMuyaTabSize
} from './muyaOptionSupport'
export {
  dispatchMuyaSelectionChange,
  dispatchMuyaSelectionFormats
} from './muyaSelectionSupport'

export const dispatchMuyaChange = muya => {
  const markdown = muya.markdown = muya.getMarkdown()
  const payload = {
    markdown,
    wordCount: muya.getWordCount(markdown),
    cursor: muya.getCursor(),
    history: muya.getHistory(),
    toc: muya.getTOC()
  }

  muya.eventCenter.dispatch('change', payload)
}
