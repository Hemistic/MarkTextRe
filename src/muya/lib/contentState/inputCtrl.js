import {
  checkQuickInsert,
  checkCursorInTokenType,
  checkNotSameToken,
  createQuickInsertReference
} from './inputSupport'
import { inputHandler } from './inputEventSupport'

const inputCtrl = ContentState => {
  // Input @ to quick insert paragraph
  ContentState.prototype.checkQuickInsert = function (block) {
    return checkQuickInsert(block)
  }

  ContentState.prototype.checkCursorInTokenType = function (functionType, text, offset, type) {
    return checkCursorInTokenType(this, functionType, text, offset, type)
  }

  ContentState.prototype.checkNotSameToken = function (functionType, oldText, text) {
    return checkNotSameToken(this, functionType, oldText, text)
  }

  ContentState.prototype.createQuickInsertReference = function (paragraph) {
    return createQuickInsertReference(this, paragraph)
  }

  ContentState.prototype.inputHandler = function (event, notEqual = false) {
    return inputHandler(this, event, notEqual)
  }
}

export default inputCtrl
