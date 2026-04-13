import {
  updateThematicBreak,
  updateAtxHeader,
  updateSetextHeader,
  updateBlockQuote,
  updateIndentCode,
  updateToParagraph
} from './updateBlockTransforms'
import { updateList, updateTaskListItem } from './updateListTransforms'
import { checkNeedRender, checkInlineUpdate } from './updateInlineAnalysis'

const updateCtrl = ContentState => {
  ContentState.prototype.checkSameMarkerOrDelimiter = function (list, markerOrDelimiter) {
    if (!/ol|ul/.test(list.type)) return false
    return list.children[0].bulletMarkerOrDelimiter === markerOrDelimiter
  }

  ContentState.prototype.checkNeedRender = function (cursor = this.cursor) {
    return checkNeedRender(this, cursor)
  }

  /**
   * block must be span block.
   */
  ContentState.prototype.checkInlineUpdate = function (block) {
    return checkInlineUpdate(this, block)
  }

  // Thematic break
  ContentState.prototype.updateThematicBreak = function (block, marker, line) {
    return updateThematicBreak(this, block, marker, line)
  }

  ContentState.prototype.updateList = function (block, type, marker = '', line) {
    return updateList(this, block, type, marker, line)
  }

  ContentState.prototype.updateTaskListItem = function (block, type, marker = '') {
    return updateTaskListItem(this, block, type, marker)
  }

  // ATX heading doesn't support soft line break and hard line break.
  ContentState.prototype.updateAtxHeader = function (block, header, line) {
    return updateAtxHeader(this, block, header, line)
  }

  ContentState.prototype.updateSetextHeader = function (block, marker, line) {
    return updateSetextHeader(this, block, marker, line)
  }

  ContentState.prototype.updateBlockQuote = function (block, line) {
    return updateBlockQuote(this, block, line)
  }

  ContentState.prototype.updateIndentCode = function (block, line) {
    return updateIndentCode(this, block, line)
  }

  ContentState.prototype.updateToParagraph = function (block, line) {
    return updateToParagraph(this, block, line)
  }
}

export default updateCtrl
