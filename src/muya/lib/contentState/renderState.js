import {
  clearContentState,
  getHistoryState,
  getPositionReference,
  initContentState,
  partialRenderContentState,
  postRender,
  renderContentState,
  setContentCursor,
  setHistoryState,
  setNextRenderRange,
  singleRenderContentState
} from './renderSupport'

const renderState = ContentState => {
  ContentState.prototype.init = function () {
    return initContentState(this)
  }

  ContentState.prototype.getHistory = function () {
    return getHistoryState(this)
  }

  ContentState.prototype.setHistory = function ({ stack, index }) {
    return setHistoryState(this, { stack, index })
  }

  ContentState.prototype.setCursor = function () {
    return setContentCursor(this)
  }

  ContentState.prototype.setNextRenderRange = function () {
    return setNextRenderRange(this)
  }

  ContentState.prototype.postRender = function () {
    return postRender(this)
  }

  ContentState.prototype.render = function (isRenderCursor = true, clearCache = false) {
    return renderContentState(this, isRenderCursor, clearCache)
  }

  ContentState.prototype.partialRender = function (isRenderCursor = true) {
    return partialRenderContentState(this, isRenderCursor)
  }

  ContentState.prototype.singleRender = function (block, isRenderCursor = true) {
    return singleRenderContentState(this, block, isRenderCursor)
  }

  ContentState.prototype.getPositionReference = function () {
    return getPositionReference(this)
  }

  ContentState.prototype.clear = function () {
    return clearContentState(this)
  }
}

export default renderState
