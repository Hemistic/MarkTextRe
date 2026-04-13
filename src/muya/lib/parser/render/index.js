import { mixins } from '../../utils'
import renderInlines from './renderInlines'
import renderBlock from './renderBlock'
import {
  flushPendingPreviewRenders,
  renderDiagramTarget,
  renderMathTarget,
  renderMermaidTarget,
  renderPendingPreview,
  resetPreviewObserver,
  schedulePreviewRender
} from './previewSupport'
import {
  partialRenderBlocksToDom,
  renderBlocksToDom,
  singleRenderBlockToDom
} from './domRenderSupport'
import {
  checkConflicted,
  collectLabels,
  getClassName,
  getHighlightClassName,
  getSelector,
  initializeStateRender,
  invalidateImageCache
} from './stateRenderHelpersSupport'

class StateRender {
  constructor (muya) {
    initializeStateRender(this, muya)
  }

  setContainer (container) {
    this.container = container
    this.resetPreviewObserver()
  }

  resetPreviewObserver () {
    return resetPreviewObserver(this)
  }

  schedulePreviewRender (key, target) {
    return schedulePreviewRender(this, key, target)
  }

  // collect link reference definition
  collectLabels (blocks) {
    return collectLabels(this, blocks)
  }

  checkConflicted (block, token, cursor) {
    return checkConflicted(this, block, token, cursor)
  }

  getClassName (outerClass, block, token, cursor) {
    return getClassName(this, outerClass, block, token, cursor)
  }

  getHighlightClassName (active) {
    return getHighlightClassName(active)
  }

  getSelector (block, activeBlocks) {
    return getSelector(this, block, activeBlocks)
  }

  async renderMermaidTarget (target, code) {
    return renderMermaidTarget(this, target, code)
  }

  async renderDiagramTarget (target, functionType, code) {
    return renderDiagramTarget(this, target, functionType, code)
  }

  async renderMathTarget (target, cacheKey, code, displayMode) {
    return renderMathTarget(this, target, cacheKey, code, displayMode)
  }

  flushPendingPreviewRenders () {
    return flushPendingPreviewRenders(this)
  }

  async renderPendingPreview (key, target) {
    return renderPendingPreview(this, key, target)
  }

  render (blocks, activeBlocks, matches) {
    return renderBlocksToDom(this, blocks, activeBlocks, matches)
  }

  // Only render the blocks which you updated
  partialRender (blocks, activeBlocks, matches, startKey, endKey) {
    return partialRenderBlocksToDom(this, blocks, activeBlocks, matches, startKey, endKey)
  }

  /**
   * Only render one block.
   *
   * @param {object} block
   * @param {array} activeBlocks
   * @param {array} matches
   */
  singleRender (block, activeBlocks, matches) {
    return singleRenderBlockToDom(this, block, activeBlocks, matches)
  }

  invalidateImageCache () {
    return invalidateImageCache(this)
  }
}

mixins(StateRender, renderInlines, renderBlock)

export default StateRender
