import selection from '../selection'
import { htmlToMarkdown } from '../utils/markdownHtml'
import marked from '../parser/marked'
import { normalizeClipboardWrapper } from './clipboardSupport'
import { getContentStateDocument } from './runtimeDomSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const getCodeSelectionClipboardData = (contentState, start, end) => {
  if (start.key !== end.key) {
    return null
  }

  const startBlock = contentState.getBlock(start.key)
  const { type, text, functionType } = startBlock
  if (type !== 'span' || functionType !== 'codeContent') {
    return null
  }

  const selectedText = text.substring(start.offset, end.offset)
  return {
    html: marked(selectedText, getContentStateOptions(contentState)),
    text: selectedText
  }
}

export const getSelectionClipboardData = contentState => {
  const html = selection.getSelectionHtml()
  const doc = getContentStateDocument(contentState)
  if (!doc) {
    return { html: '', text: '' }
  }
  const wrapper = doc.createElement('div')
  wrapper.innerHTML = html
  normalizeClipboardWrapper(contentState, wrapper)

  let htmlData = wrapper.innerHTML
  const textData = htmlToMarkdown(contentState, htmlData)
  htmlData = marked(textData)

  return { html: htmlData, text: textData }
}
