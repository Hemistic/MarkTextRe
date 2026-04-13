import { getSanitizeHtml } from '../utils/sanitizeHtml'
import ExportMarkdown from '../utils/exportMarkdown'
import { getContentStateOptions } from './runtimeOptionSupport'

export const handleCopyAsHtml = (contentState, event, text) => {
  if (text.length <= 0) {
    return
  }

  event.clipboardData.setData('text/html', '')
  const { superSubScript, footnote, isGitlabCompatibilityEnabled } = getContentStateOptions(contentState)
  event.clipboardData.setData('text/plain', getSanitizeHtml(text, {
    superSubScript,
    footnote,
    isGitlabCompatibilityEnabled
  }))
}

export const handleCopyBlock = (contentState, event, copyInfo) => {
  const block = typeof copyInfo === 'string' ? contentState.getBlock(copyInfo) : copyInfo
  if (!block) {
    return
  }

  const anchor = contentState.getAnchor(block)
  const { isGitlabCompatibilityEnabled, listIndentation } = contentState
  const markdown = new ExportMarkdown([anchor], listIndentation, isGitlabCompatibilityEnabled).generate()
  if (markdown.length > 0) {
    event.clipboardData.setData('text/html', '')
    event.clipboardData.setData('text/plain', markdown)
  }
}

export const handleCopyCodeContent = (event, codeContent) => {
  if (typeof codeContent !== 'string' || codeContent.length <= 0) {
    return
  }

  event.clipboardData.setData('text/html', '')
  event.clipboardData.setData('text/plain', codeContent)
}
