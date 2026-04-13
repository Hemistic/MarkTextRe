import selection from '../selection'
import { htmlToMarkdown } from '../utils/markdownHtml'
import marked from '../parser/marked'
import { createClipboardWrapper } from './clipboardWrapperSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const getCodeSelectionClipboardData = (contentState, start, end) => {
  if (start.key !== end.key) {
    return null
  }

  const startBlock = contentState.getBlock(start.key)
  if (!startBlock) {
    return null
  }
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
  const wrapper = createClipboardWrapper(contentState, html)
  if (!wrapper) {
    return { html: '', text: '' }
  }

  let htmlData = wrapper.innerHTML
  const textData = htmlToMarkdown(contentState, htmlData)
  htmlData = marked(textData)

  return { html: htmlData, text: textData }
}
