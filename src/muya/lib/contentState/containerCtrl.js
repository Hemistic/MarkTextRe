import {
  createContainerBlock,
  createPreAndPreview,
  handleContainerBlockClick,
  initContainerBlock,
  updateMathBlock
} from './containerSupport'

const containerCtrl = ContentState => {
  ContentState.prototype.createContainerBlock = function (functionType, value = '', style = undefined) {
    return createContainerBlock(this, functionType, value, style)
  }

  ContentState.prototype.createPreAndPreview = function (functionType, value = '') {
    return createPreAndPreview(this, functionType, value)
  }

  ContentState.prototype.initContainerBlock = function (functionType, block, style = undefined) { // p block
    return initContainerBlock(this, functionType, block, style)
  }

  ContentState.prototype.handleContainerBlockClick = function (figureEle) {
    return handleContainerBlockClick(this, figureEle)
  }

  ContentState.prototype.updateMathBlock = function (block) {
    return updateMathBlock(this, block)
  }
}

export default containerCtrl
