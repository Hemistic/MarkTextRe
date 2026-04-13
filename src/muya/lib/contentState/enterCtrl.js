import selection from '../selection'
import { isOsx } from '../config'
import { resolveActiveCursorRange } from './cursorStateSupport'
import {
  chopBlockByCursor,
  chopBlock,
  createRow,
  createBlockLi,
  createTaskItemBlock,
  enterInEmptyParagraph,
  getFirstBlockInNextRow,
  getParagraphBlock
} from './enterSupport'
import {
  handleDocEnter,
  normalizeSelectionBeforeEnter,
  handleFootnoteEnter,
  handleShiftEnter,
  handleTableEnter,
  prepareEnterBlock,
  splitBlockOnEnter,
  finalizeEnter
} from './enterHandlerSupport'

/* eslint-disable no-useless-escape */
const FOOTNOTE_REG = /^\[\^([^\^\[\]\s]+?)(?<!\\)\]:$/
/* eslint-enable no-useless-escape */

const enterCtrl = ContentState => {
  // TODO@jocs this function need opti.
  ContentState.prototype.chopBlockByCursor = function (block, key, offset) {
    return chopBlockByCursor(this, block, key, offset)
  }

  ContentState.prototype.chopBlock = function (block) {
    return chopBlock(this, block)
  }

  ContentState.prototype.createRow = function (row, isHeader = false) {
    return createRow(this, row, isHeader)
  }

  ContentState.prototype.createBlockLi = function (paragraphInListItem) {
    return createBlockLi(this, paragraphInListItem)
  }

  ContentState.prototype.createTaskItemBlock = function (paragraphInListItem, checked = false) {
    return createTaskItemBlock(this, paragraphInListItem, checked)
  }

  ContentState.prototype.enterInEmptyParagraph = function (block) {
    return enterInEmptyParagraph(this, block)
  }

  ContentState.prototype.docEnterHandler = function (event) {
    return handleDocEnter(this, event)
  }

  ContentState.prototype.enterHandler = function (event) {
    const cursorContext = resolveActiveCursorRange(this, selection.getCursorRange())
    if (!cursorContext) {
      return event.preventDefault()
    }
    const { start, end } = cursorContext
    let block = this.getBlock(start.key)
    if (!block) {
      return
    }

    event.preventDefault()

    // Don't allow new lines in language identifiers (GH#569)
    if (block.functionType && block.functionType === 'languageInput') {
      // Jump inside the code block and update code language if necessary
      this.updateCodeLanguage(block, block.text.trim())
      return
    }
    // handle select multiple blocks
    if (normalizeSelectionBeforeEnter(this, start, end)) {
      return this.enterHandler(event)
    }

    if (handleFootnoteEnter(this, event, block, start, FOOTNOTE_REG)) {
      return
    }

    // handle `shift + enter` insert `soft line break` or `hard line break`
    // only cursor in `line block` can create `soft line break` and `hard line break`
    // handle line in code block
    if (handleShiftEnter(this, event, block, start)) {
      return
    }

    if (handleTableEnter(this, event, block, isOsx, getFirstBlockInNextRow)) {
      return
    }

    const context = prepareEnterBlock(this, block, start)
    block = context.block
    const newBlock = splitBlockOnEnter(this, context, start)
    if (!newBlock) {
      return
    }

    finalizeEnter(this, block, newBlock, getParagraphBlock)
  }
}

export default enterCtrl
