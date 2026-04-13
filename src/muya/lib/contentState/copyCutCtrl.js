import {
  copyHandler,
  cutHandler,
  docCopyHandler,
  docCutHandler,
  getContentStateClipboardData
} from './copyCutSupport'

const copyCutCtrl = ContentState => {
  ContentState.prototype.docCutHandler = function (event) {
    return docCutHandler(this, event)
  }

  ContentState.prototype.cutHandler = function () {
    return cutHandler(this)
  }

  ContentState.prototype.getClipBoardData = function () {
    return getContentStateClipboardData(this)
  }

  ContentState.prototype.docCopyHandler = function (event) {
    return docCopyHandler(this, event)
  }

  ContentState.prototype.copyHandler = function (event, type, copyInfo = null) {
    return copyHandler(this, event, type, copyInfo)
  }
}

export default copyCutCtrl
