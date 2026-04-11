import { handleCodeBlockMenu, insertContainerBlock, insertHtmlBlock } from './paragraphBlockTransforms'
import { isAllowedTransformation, getTypeFromBlock } from './paragraphTypeResolver'
import { insertParagraph, duplicateParagraph, deleteParagraph, isSelectAll, selectAllContent, selectAll } from './paragraphDocumentOps'
import {
  selectionChange,
  getCommonParent,
  handleFrontMatter,
  handleListMenu,
  handleLooseListItem,
  handleQuoteMenu,
  showTablePicker,
  updateParagraph
} from './paragraphMenuSupport'

const paragraphCtrl = ContentState => {
  ContentState.prototype.selectionChange = function (cursor) {
    return selectionChange(this, cursor)
  }

  ContentState.prototype.getCommonParent = function () {
    return getCommonParent(this)
  }

  ContentState.prototype.handleFrontMatter = function () {
    return handleFrontMatter(this)
  }

  // TODO: New created nestled list items missing "listType" key and value.

  ContentState.prototype.handleListMenu = function (paraType, insertMode) {
    return handleListMenu(this, paraType, insertMode)
  }

  ContentState.prototype.handleLooseListItem = function () {
    return handleLooseListItem(this)
  }

  ContentState.prototype.handleCodeBlockMenu = function () {
    return handleCodeBlockMenu(this)
  }

  ContentState.prototype.handleQuoteMenu = function (insertMode) {
    return handleQuoteMenu(this, insertMode)
  }

  ContentState.prototype.insertContainerBlock = function (functionType, block) {
    return insertContainerBlock(this, functionType, block)
  }

  ContentState.prototype.showTablePicker = function () {
    return showTablePicker(this)
  }

  ContentState.prototype.insertHtmlBlock = function (block) {
    return insertHtmlBlock(this, block)
  }

  ContentState.prototype.updateParagraph = function (paraType, insertMode = false) {
    return updateParagraph(this, paraType, insertMode)
  }

  ContentState.prototype.insertParagraph = function (location, text = '', outMost = false) {
    return insertParagraph(this, location, text, outMost)
  }

  // make a dulication of the current block
  ContentState.prototype.duplicate = function () {
    return duplicateParagraph(this)
  }

  // delete current paragraph
  ContentState.prototype.deleteParagraph = function (blockKey) {
    return deleteParagraph(this, blockKey)
  }

  ContentState.prototype.isSelectAll = function () {
    return isSelectAll(this)
  }

  ContentState.prototype.selectAllContent = function () {
    return selectAllContent(this)
  }

  ContentState.prototype.selectAll = function () {
    return selectAll(this)
  }

  // Test whether the paragraph transformation is valid.
  ContentState.prototype.isAllowedTransformation = function (block, toType, isMultilineSelection) {
    return isAllowedTransformation(this, block, toType, isMultilineSelection)
  }

  // Translate block type into internal name.
  ContentState.prototype.getTypeFromBlock = function (block) {
    return getTypeFromBlock(this, block)
  }
}

export default paragraphCtrl
