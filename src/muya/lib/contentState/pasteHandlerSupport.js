import { PREVIEW_DOMPURIFY_CONFIG } from '../config'
import { sanitize } from '../utils'
import { resolvePasteFragments } from './pasteFragments'
import { finalizePasteFragments } from './pasteFinalizeSupport'
import { handleDirectPasteTarget } from './pasteTargetSupport'
import {
  checkCopyType,
  checkPasteType,
  handleDocPaste,
  resolvePasteSource
} from './pasteTypeSupport'

export { checkCopyType, checkPasteType, handleDocPaste }

export const pasteHandler = async (contentState, event, type = 'normal', rawText, rawHtml) => {
  event.preventDefault()
  event.stopPropagation()

  let { text, html } = await resolvePasteSource(contentState, event, rawText, rawHtml)

  let copyType = contentState.checkCopyType(html, text)
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const parent = contentState.getParent(startBlock)

  if (copyType === 'htmlToMd') {
    html = sanitize(text, PREVIEW_DOMPURIFY_CONFIG, false)
    copyType = 'normal'
  }

  if (start.key !== end.key) {
    contentState.cutHandler()
    return contentState.pasteHandler(event, type, rawText, rawHtml)
  }

  if (!html) {
    const file = await contentState.pasteImage(event)
    if (file) {
      return
    }
  }

  if (handleDirectPasteTarget(contentState, type, text, copyType, startBlock, parent, start, end)) {
    return
  }

  const stateFragments = await resolvePasteFragments(contentState, type, copyType, text, html)

  if (stateFragments.length <= 0) {
    return
  }

  finalizePasteFragments(contentState, startBlock, endBlock, parent, stateFragments, start.offset, end.offset)
}
