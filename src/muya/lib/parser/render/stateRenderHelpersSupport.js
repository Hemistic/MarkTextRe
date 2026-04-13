import { CLASS_OR_ID } from '../../config'
import { conflict, camelToSnake } from '../../utils'
import { collectReferenceLabels } from '../referenceLabelSupport'

export const initializeStateRender = (stateRender, muya) => {
  stateRender.muya = muya
  stateRender.eventCenter = muya.eventCenter
  stateRender.codeCache = new Map()
  stateRender.loadImageMap = new Map()
  stateRender.loadMathMap = new Map()
  stateRender.mermaidCache = new Map()
  stateRender.diagramCache = new Map()
  stateRender.tokenCache = new Map()
  stateRender.labels = new Map()
  stateRender.urlMap = new Map()
  stateRender.renderingTable = null
  stateRender.renderingRowContainer = null
  stateRender.container = null
  stateRender.pendingPreviewRenders = new Map()
  stateRender.scheduledPreviewRenders = new Set()
  stateRender.previewObserver = null
}

export const collectLabels = (stateRender, blocks) => {
  stateRender.labels = collectReferenceLabels(blocks)
}

export const checkConflicted = (stateRender, block, token, cursor) => {
  const { start, end } = cursor
  const key = block.key
  const { start: tokenStart, end: tokenEnd } = token.range

  if (key !== start.key && key !== end.key) {
    return false
  } else if (key === start.key && key !== end.key) {
    return conflict([tokenStart, tokenEnd], [start.offset, start.offset])
  } else if (key !== start.key && key === end.key) {
    return conflict([tokenStart, tokenEnd], [end.offset, end.offset])
  } else {
    return conflict([tokenStart, tokenEnd], [start.offset, start.offset]) ||
      conflict([tokenStart, tokenEnd], [end.offset, end.offset])
  }
}

export const getClassName = (stateRender, outerClass, block, token, cursor) => {
  return outerClass || (checkConflicted(stateRender, block, token, cursor) ? CLASS_OR_ID.AG_GRAY : CLASS_OR_ID.AG_HIDE)
}

export const getHighlightClassName = active => {
  return active ? CLASS_OR_ID.AG_HIGHLIGHT : CLASS_OR_ID.AG_SELECTION
}

export const getSelector = (stateRender, block, activeBlocks) => {
  const { cursor, selectedBlock } = stateRender.muya.contentState
  const type = block.type === 'hr' ? 'p' : block.type
  const isActive = activeBlocks.some(b => b.key === block.key) || block.key === cursor.start.key

  let selector = `${type}#${block.key}.${CLASS_OR_ID.AG_PARAGRAPH}`
  if (isActive) {
    selector += `.${CLASS_OR_ID.AG_ACTIVE}`
  }
  if (type === 'span') {
    selector += `.ag-${camelToSnake(block.functionType)}`
  }
  if (!block.parent && selectedBlock && block.key === selectedBlock.key) {
    selector += `.${CLASS_OR_ID.AG_SELECTED}`
  }
  return selector
}

export const invalidateImageCache = stateRender => {
  stateRender.loadImageMap.forEach((imageInfo, key) => {
    imageInfo.touchMsec = Date.now()
    stateRender.loadImageMap.set(key, imageInfo)
  })
}
