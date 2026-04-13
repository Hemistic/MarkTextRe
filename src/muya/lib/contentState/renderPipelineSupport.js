import {
  clearContentStateTokenCache
} from './runtimeRenderAccessSupport'

import {
  setContentCursor,
  setNextRenderRange
} from './renderCursorSupport'
import { blurContentState } from './runtimeMuyaSupport'
import {
  canRenderRange,
  prepareRenderContext,
  resolveRenderIndices
} from './renderPipelineStateSupport'
import {
  captureRenderScrollAnchor,
  restoreRenderScrollAnchor
} from './renderScrollAnchorSupport'
import {
  applyResolvedRenderCursorAction,
  resolveRenderCursorAction
} from './renderCursorRestoreSupport'

const completeRender = (contentState, isRenderCursor) => {
  const action = resolveRenderCursorAction(contentState, isRenderCursor)
  applyResolvedRenderCursorAction(contentState, action, setContentCursor, blurContentState)
  postRender(contentState)
}

export const postRender = contentState => {
  contentState.resizeLineNumber()
}

export const renderContentState = (contentState, isRenderCursor = true, clearCache = false) => {
  const context = prepareRenderContext(contentState)
  if (!context) {
    return
  }

  const { stateRender, blocks, activeBlocks, matches } = context
  const scrollAnchor = captureRenderScrollAnchor(contentState)
  if (clearCache) {
    clearContentStateTokenCache(contentState)
  }
  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.render(blocks, activeBlocks, matches)
  restoreRenderScrollAnchor(contentState, scrollAnchor)
  completeRender(contentState, isRenderCursor)
}

export const partialRenderContentState = (contentState, isRenderCursor = true) => {
  const context = prepareRenderContext(contentState)
  if (!context) {
    return
  }

  const { stateRender, blocks, matches } = context
  const scrollAnchor = captureRenderScrollAnchor(contentState)
  const [startKey, endKey] = Array.isArray(contentState.renderRange)
    ? contentState.renderRange
    : [null, null]

  if (!canRenderRange(blocks, startKey, endKey)) {
    setNextRenderRange(contentState)
    stateRender.collectLabels(blocks)
    stateRender.render(blocks, context.activeBlocks, matches)
    restoreRenderScrollAnchor(contentState, scrollAnchor)
    completeRender(contentState, isRenderCursor)
    return
  }

  const [startIndex, endIndex] = resolveRenderIndices(blocks, startKey, endKey)
  const blocksToRender = blocks.slice(startIndex, endIndex)
  const activeBlocks = context.activeBlocks.length
    ? context.activeBlocks
    : contentState.getActiveBlocks(blocksToRender[0] || null)

  if (!blocksToRender.length) {
    setNextRenderRange(contentState)
    stateRender.collectLabels(blocks)
    stateRender.render(blocks, activeBlocks, matches)
    restoreRenderScrollAnchor(contentState, scrollAnchor)
    completeRender(contentState, isRenderCursor)
    return
  }

  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.partialRender(blocksToRender, activeBlocks, matches, startKey, endKey)
  restoreRenderScrollAnchor(contentState, scrollAnchor)
  completeRender(contentState, isRenderCursor)
}

export const singleRenderContentState = (contentState, block, isRenderCursor = true) => {
  const context = prepareRenderContext(contentState, block)
  if (!context || !block) {
    return
  }

  const { stateRender, blocks, activeBlocks, matches } = context
  const scrollAnchor = captureRenderScrollAnchor(contentState)
  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.singleRender(block, activeBlocks, matches)
  restoreRenderScrollAnchor(contentState, scrollAnchor)
  completeRender(contentState, isRenderCursor)
}

export const clearContentState = contentState => {
  contentState.history.clearHistory()
}
