import { createBlock, createBlockP, copyBlock } from './blockCreate'
import { getBlock } from './blockQuery'

export const registerBlockBasicApi = ContentState => {
  ContentState.prototype.createBlock = function (type = 'span', extras = {}) {
    return createBlock(type, extras)
  }

  ContentState.prototype.createBlockP = function (text = '') {
    return createBlockP(this, text)
  }

  ContentState.prototype.isCollapse = function (cursor = this.cursor) {
    const { start, end } = cursor
    return start.key === end.key && start.offset === end.offset
  }

  ContentState.prototype.getBlocks = function () {
    return this.blocks
  }

  ContentState.prototype.getCursor = function () {
    return this.cursor
  }

  ContentState.prototype.getBlock = function (key) {
    return getBlock(this, key)
  }

  ContentState.prototype.copyBlock = function (origin) {
    return copyBlock(this, origin)
  }
}
