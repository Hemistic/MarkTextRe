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

export const registerBlockMutationApi = ContentState => {
  ContentState.prototype.removeTextOrBlock = function (block) {
    return removeTextOrBlock(this, block)
  }

  ContentState.prototype.removeBlocks = function (before, after, isRemoveAfter = true, isRecursion = false) {
    return removeBlocks(this, before, after, isRemoveAfter, isRecursion)
  }

  ContentState.prototype.removeBlock = function (block, fromBlocks = this.blocks) {
    return removeBlock(this, block, fromBlocks)
  }

  ContentState.prototype.insertAfter = function (newBlock, oldBlock) {
    return insertAfter(this, newBlock, oldBlock)
  }

  ContentState.prototype.insertBefore = function (newBlock, oldBlock) {
    return insertBefore(this, newBlock, oldBlock)
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
}
