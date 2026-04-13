import selection from '../selection'
import { resolveActiveCursorRange } from './cursorStateSupport'
import {
  checkBackspaceCase,
} from './backspaceSupport'
import {
  handleDocBackspace,
  handleSelectionBackspace,
  handleAtxHeadingBackspace,
  handleTokenBackspace,
  handleTableSelectionBackspace,
  handleCellContentSelectionBackspace,
  handleCodeContentBackspace,
  getBackspaceContext,
  handleInlineImageBackspace,
  handleCellBoundaryBackspace,
  handleFootnoteBackspace,
  handleCodeBlockStartBackspace,
  handleTableCellStartBackspace,
  handleInlineDegradeBackspace,
  handleMergeWithPreviousBackspace
} from './backspaceHandlerSupport'

const backspaceCtrl = ContentState => {
  ContentState.prototype.checkBackspaceCase = function () {
    return checkBackspaceCase(this)
  }

  ContentState.prototype.docBackspaceHandler = function (event) {
    return handleDocBackspace(this, event)
  }

  ContentState.prototype.backspaceHandler = function (event) {
    const cursorContext = resolveActiveCursorRange(this, selection.getCursorRange())
    if (!cursorContext) {
      return
    }
    const { start, end, startBlock, endBlock } = cursorContext

    if (handleSelectionBackspace(this, event)) {
      return
    }

    const startOutmostBlock = this.findOutMostBlock(startBlock)
    const endOutmostBlock = this.findOutMostBlock(endBlock)
    if (handleAtxHeadingBackspace(this, event, start, end, startBlock)) {
      return
    }

    if (handleTokenBackspace(this, event, startBlock, start, end)) {
      return
    }

    if (handleTableSelectionBackspace(this, event, startBlock, endBlock, startOutmostBlock, endOutmostBlock)) {
      return
    }

    if (handleCellContentSelectionBackspace(this, event, startBlock)) {
      return
    }

    if (handleCodeContentBackspace(this, event, startBlock, endBlock)) {
      return
    }

    if (start.key !== end.key || start.offset !== end.offset) {
      return
    }

    const context = getBackspaceContext(this)
    let { block, parent, preBlock, left, right, inlineDegrade } = context
    if (!block) {
      block = startBlock
      parent = this.getParent(startBlock)
      preBlock = this.findPreBlockInLocation(startBlock)
      left = start.offset
      right = typeof startBlock.text === 'string' ? startBlock.text.length - start.offset : 0
    }

    if (handleInlineImageBackspace(this, event, context, startBlock, start)) {
      return
    }

    if (handleCellBoundaryBackspace(this, event, startBlock, left, right)) {
      return
    }

    if (handleFootnoteBackspace(this, event, block, parent, preBlock, left)) {
      return
    }

    if (handleCodeBlockStartBackspace(this, event, block, parent, left)) {
      return
    }

    if (handleTableCellStartBackspace(this, event, block, preBlock, left)) {
      return
    }

    if (handleInlineDegradeBackspace(this, event, block, parent, inlineDegrade)) {
      return
    }

    if (handleMergeWithPreviousBackspace(this, event, block, parent, preBlock, left)) {
      return
    }
  }
}

export default backspaceCtrl
