import {
  firstInDescendant,
  lastInDescendant,
  findPreBlockInLocation,
  findNextBlockInLocation,
  getFirstBlock,
  getLastBlock,
  closest,
  getAnchor
} from './blockQuery'

export const registerBlockTreeTraversalApi = ContentState => {
  ContentState.prototype.firstInDescendant = function (block) {
    return firstInDescendant(this, block)
  }

  ContentState.prototype.lastInDescendant = function (block) {
    return lastInDescendant(this, block)
  }

  ContentState.prototype.findPreBlockInLocation = function (block) {
    return findPreBlockInLocation(this, block)
  }

  ContentState.prototype.findNextBlockInLocation = function (block) {
    return findNextBlockInLocation(this, block)
  }

  ContentState.prototype.getFirstBlock = function () {
    return getFirstBlock(this)
  }

  ContentState.prototype.getLastBlock = function () {
    return getLastBlock(this)
  }

  ContentState.prototype.closest = function (block, type) {
    return closest(this, block, type)
  }

  ContentState.prototype.getAnchor = function (block) {
    return getAnchor(this, block)
  }
}
