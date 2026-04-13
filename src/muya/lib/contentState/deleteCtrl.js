import {
  deleteHandler,
  docDeleteHandler
} from './deleteSupport'

const deleteCtrl = ContentState => {
  // Handle `delete` keydown event on document.
  ContentState.prototype.docDeleteHandler = function (event) {
    return docDeleteHandler(this, event)
  }

  ContentState.prototype.deleteHandler = function (event) {
    return deleteHandler(this, event)
  }
}

export default deleteCtrl
