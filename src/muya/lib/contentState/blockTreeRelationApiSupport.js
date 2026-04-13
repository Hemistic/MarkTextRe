import {
  getParent,
  getParents,
  getPreSibling,
  getNextSibling,
  isInclude,
  getActiveBlocks,
  findOutMostBlock,
  findIndex,
  canInserFrontMatter,
  isFirstChild,
  isLastChild,
  isOnlyChild,
  isOnlyRemoveableChild,
  getLastChild
} from './blockQuery'

export const registerBlockTreeRelationApi = ContentState => {
  ContentState.prototype.getParent = function (block) {
    return getParent(this, block)
  }

  ContentState.prototype.getParents = function (block) {
    return getParents(this, block)
  }

  ContentState.prototype.getPreSibling = function (block) {
    return getPreSibling(this, block)
  }

  ContentState.prototype.getNextSibling = function (block) {
    return getNextSibling(this, block)
  }

  ContentState.prototype.isInclude = function (parent, target) {
    return isInclude(this, parent, target)
  }

  ContentState.prototype.getActiveBlocks = function () {
    return getActiveBlocks(this)
  }

  ContentState.prototype.findOutMostBlock = function (block) {
    return findOutMostBlock(this, block)
  }

  ContentState.prototype.findIndex = function (children, block) {
    return findIndex(children, block)
  }

  ContentState.prototype.canInserFrontMatter = function (block) {
    return canInserFrontMatter(this, block)
  }

  ContentState.prototype.isFirstChild = function (block) {
    return isFirstChild(block)
  }

  ContentState.prototype.isLastChild = function (block) {
    return isLastChild(block)
  }

  ContentState.prototype.isOnlyChild = function (block) {
    return isOnlyChild(block)
  }

  ContentState.prototype.isOnlyRemoveableChild = function (block) {
    return isOnlyRemoveableChild(this, block)
  }

  ContentState.prototype.getLastChild = function (block) {
    return getLastChild(block)
  }
}
