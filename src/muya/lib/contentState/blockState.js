import { createBlock, createBlockP, copyBlock } from './blockCreate'
import {
  getBlock,
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
  getLastChild,
  firstInDescendant,
  lastInDescendant,
  findPreBlockInLocation,
  findNextBlockInLocation,
  getFirstBlock,
  getLastBlock,
  closest,
  getAnchor
} from './blockQuery'
import {
  removeTextOrBlock,
  removeBlocks,
  removeBlock,
  insertAfter,
  insertBefore,
  prependChild,
  appendChild,
  replaceBlock
} from './blockManipulate'

const blockState = ContentState => {
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

  ContentState.prototype.removeTextOrBlock = function (block) {
    return removeTextOrBlock(this, block)
  }

  ContentState.prototype.removeBlocks = function (before, after, isRemoveAfter = true, isRecursion = false) {
    return removeBlocks(this, before, after, isRemoveAfter, isRecursion)
  }

  ContentState.prototype.removeBlock = function (block, fromBlocks = this.blocks) {
    return removeBlock(this, block, fromBlocks)
  }

  ContentState.prototype.getActiveBlocks = function () {
    return getActiveBlocks(this)
  }

  ContentState.prototype.insertAfter = function (newBlock, oldBlock) {
    return insertAfter(this, newBlock, oldBlock)
  }

  ContentState.prototype.insertBefore = function (newBlock, oldBlock) {
    return insertBefore(this, newBlock, oldBlock)
  }

  ContentState.prototype.findOutMostBlock = function (block) {
    return findOutMostBlock(this, block)
  }

  ContentState.prototype.findIndex = function (children, block) {
    return findIndex(children, block)
  }

  ContentState.prototype.prependChild = function (parent, block) {
    return prependChild(parent, block)
  }

  ContentState.prototype.appendChild = function (parent, block) {
    return appendChild(parent, block)
  }

  ContentState.prototype.replaceBlock = function (newBlock, oldBlock) {
    return replaceBlock(this, newBlock, oldBlock)
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

export default blockState
