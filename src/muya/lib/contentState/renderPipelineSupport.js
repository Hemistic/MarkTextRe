import {
  clearContentStateTokenCache
} from './runtimeRenderAccessSupport'

import {
  setContentCursor,
  setNextRenderRange
} from './renderCursorSupport'
import { blurContentState } from './runtimeMuyaSupport'
import {
  prepareRenderContext,
  resolveRenderIndices
} from './renderPipelineStateSupport'
import { resolveRenderCursorAction } from './renderCursorRestoreSupport'

const completeRender = (contentState, isRenderCursor) => {
  const action = resolveRenderCursorAction(contentState, isRenderCursor)

  if (action === 'restore') {
    setContentCursor(contentState)
  } else if (action === 'blur') {
    blurContentState(contentState)
  }

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
  if (clearCache) {
    clearContentStateTokenCache(contentState)
  }
  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.render(blocks, activeBlocks, matches)
  completeRender(contentState, isRenderCursor)
}

export const partialRenderContentState = (contentState, isRenderCursor = true) => {
  const context = prepareRenderContext(contentState)
  if (!context) {
    return
  }

  const { stateRender, blocks, activeBlocks, matches } = context
  const [startKey, endKey] = contentState.renderRange
  const [startIndex, endIndex] = resolveRenderIndices(blocks, startKey, endKey)
  const blocksToRender = blocks.slice(startIndex, endIndex)

  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.partialRender(blocksToRender, activeBlocks, matches, startKey, endKey)
  completeRender(contentState, isRenderCursor)
}

export const singleRenderContentState = (contentState, block, isRenderCursor = true) => {
  const context = prepareRenderContext(contentState)
  if (!context || !block) {
    return
  }

  const { stateRender, blocks, activeBlocks, matches } = context
  setNextRenderRange(contentState)
  stateRender.collectLabels(blocks)
  stateRender.singleRender(block, activeBlocks, matches)
  completeRender(contentState, isRenderCursor)
}

export const clearContentState = contentState => {
  contentState.history.clearHistory()
}
