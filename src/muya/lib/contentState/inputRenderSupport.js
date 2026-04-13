import { dispatchContentStateEvent } from './runtimeEventSupport'

let renderCodeBlockTimer = null

const NEED_MARKED_UPDATE_RE = /atxLine|paragraphContent|cellContent/
const NEED_INLINE_UPDATE_RE = /atxLine|paragraphContent|cellContent|thematicBreakLine/

export const renderCodeBlockNow = (contentState, block) => {
  const anchor = contentState.getAnchor(block)

  if (anchor) {
    contentState.singleRender(anchor)
    return
  }

  contentState.partialRender()
}

export const dispatchQuickInsert = (contentState, paragraph, block) => {
  const show = !!contentState.checkQuickInsert(block)
  const reference = show && paragraph
    ? contentState.createQuickInsertReference(paragraph)
    : null

  dispatchContentStateEvent(contentState, 'muya-quick-insert', reference, block, show)
}

export const scheduleCodeBlockRender = (contentState, block, needRender) => {
  if (renderCodeBlockTimer) {
    clearTimeout(renderCodeBlockTimer)
  }

  if (needRender) {
    renderCodeBlockNow(contentState, block)
    return
  }

  renderCodeBlockTimer = setTimeout(() => {
    renderCodeBlockNow(contentState, block)
  }, 180)
}

export const resolveInputRenderState = (contentState, block, needRender, needRenderAll) => {
  const checkMarkedUpdate = NEED_MARKED_UPDATE_RE.test(block.functionType)
    ? contentState.checkNeedRender()
    : false
  let inlineUpdatedBlock = null

  if (NEED_INLINE_UPDATE_RE.test(block.functionType)) {
    inlineUpdatedBlock = contentState.isCollapse() && contentState.checkInlineUpdate(block)
  }

  if (inlineUpdatedBlock) {
    const liBlock = contentState.getParent(inlineUpdatedBlock)
    if (liBlock && liBlock.type === 'li' && liBlock.preSibling && liBlock.nextSibling) {
      needRenderAll = true
    }
  }

  if (checkMarkedUpdate || inlineUpdatedBlock || needRender) {
    return needRenderAll ? contentState.render() : contentState.partialRender()
  }
}
