import { URL_REG } from '../config'
export {
  checkCopyType,
  checkPasteType,
  isListFragment
} from './pasteClassifierSupport'

export const handleDocPaste = async (contentState, event) => {
  const file = await contentState.pasteImage(event)
  if (file) {
    event.preventDefault()
    return true
  }

  if (contentState.selectedTableCells) {
    const { start } = contentState.cursor
    const startBlock = contentState.getBlock(start.key)
    const { selectedTableCells: stc } = contentState

    if (startBlock && startBlock.functionType === 'cellContent' && stc.row === 1 && stc.column === 1) {
      contentState.pasteHandler(event)
      event.preventDefault()
      return true
    }
  }

  return false
}

export const resolvePasteSource = async (contentState, event, rawText, rawHtml) => {
  const text = rawText || event.clipboardData.getData('text/plain')
  let html = rawHtml || event.clipboardData.getData('text/html')

  if (URL_REG.test(text) && !/\s/.test(text) && !html) {
    html = `<a href="${text}">${text}</a>`
  }

  html = await contentState.standardizeHTML(html)

  return { text, html }
}
