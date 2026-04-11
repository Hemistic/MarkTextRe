import selection from '../selection'
import {
  findNextCell,
  findPreviousCell,
  isUnindentableListItem,
  isIndentableListItem,
  unindentListItem,
  indentListItem,
  insertTab,
  checkCursorAtEndFormat,
  tryJumpOutOfFormat,
  tryAutocompleteHtmlTag,
  resolveNextTabCell
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
    // disable tab focus
    event.preventDefault()

    const { start, end } = selection.getCursorRange()
    if (!start || !end) {
      return
    }
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)

    if (event.shiftKey && startBlock.functionType !== 'cellContent') {
      const unindentType = this.isUnindentableListItem(startBlock)
      if (unindentType) {
        this.unindentListItem(startBlock, unindentType)
      }
      return
    }

    // Handle `tab` to jump to the end of format when the cursor is at the end of format content.
    if (tryJumpOutOfFormat(this, start, end, startBlock)) {
      return
    }

    // Auto-complete of inline html tag and html block and `html` code block.
    if (tryAutocompleteHtmlTag(this, start, end, startBlock)) {
      return
    }

    // Handle `tab` key in table cell.
    const nextCell = resolveNextTabCell(this, event, start, end, startBlock, endBlock)
    if (nextCell) {
      const { key } = nextCell

      const offset = 0
      this.cursor = {
        start: { key, offset },
        end: { key, offset }
      }

      const figure = this.closest(nextCell, 'figure')
      return this.singleRender(figure)
    }

    if (this.isIndentableListItem()) {
      return this.indentListItem()
    }
    return this.insertTab()
  }
}

export default tabCtrl
