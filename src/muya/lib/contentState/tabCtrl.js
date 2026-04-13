import {
  findNextCell,
  findPreviousCell,
  isUnindentableListItem,
  isIndentableListItem,
  unindentListItem,
  indentListItem,
  insertTab,
  checkCursorAtEndFormat,
  tabHandler
} from './tabSupport'

const tabCtrl = ContentState => {
  ContentState.prototype.findNextCell = function (block) {
    return findNextCell(this, block)
  }

  ContentState.prototype.findPreviousCell = function (block) {
    return findPreviousCell(this, block)
  }

  ContentState.prototype.isUnindentableListItem = function (block) {
    return isUnindentableListItem(this, block)
  }

  ContentState.prototype.isIndentableListItem = function () {
    return isIndentableListItem(this)
  }

  ContentState.prototype.unindentListItem = function (block, type) {
    return unindentListItem(this, block, type)
  }

  ContentState.prototype.indentListItem = function () {
    return indentListItem(this)
  }

  ContentState.prototype.insertTab = function () {
    return insertTab(this)
  }

  ContentState.prototype.checkCursorAtEndFormat = function (text, offset) {
    return checkCursorAtEndFormat(this, text, offset)
  }

  ContentState.prototype.tabHandler = function (event) {
    return tabHandler(this, event)
  }
}

export default tabCtrl
