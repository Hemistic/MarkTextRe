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
} from './enterHandlerSupport'
import { handleLanguageInputEnter } from './enterLanguageInputSupport'
import {
  resolveEnterCursorBlock,
  handleEnterPreSplitStage,
  splitAndFinalizeEnterBlock
} from './enterCtrlSupport'

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
    const block = resolveEnterCursorBlock(this, start)
    if (!block) {
      return
    }

    event.preventDefault()

    // Don't allow new lines in language identifiers (GH#569)
    if (handleLanguageInputEnter(this, block)) {
      return
    }
    // handle select multiple blocks
    if (normalizeSelectionBeforeEnter(this, start, end)) {
      return this.enterHandler(event)
    }

    if (handleEnterPreSplitStage(this, event, block, start, FOOTNOTE_REG, isOsx, getFirstBlockInNextRow)) {
      return
    }

    splitAndFinalizeEnterBlock(this, block, start, getParagraphBlock)
  }
}

export default enterCtrl
