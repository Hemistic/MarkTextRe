import {
  findNextRowCell,
  findPrevRowCell,
  docArrowHandler,
  arrowHandler
} from './arrowSupport'

const arrowCtrl = ContentState => {
  ContentState.prototype.findNextRowCell = function (cell) {
    return findNextRowCell(this, cell)
  }

  ContentState.prototype.findPrevRowCell = function (cell) {
    return findPrevRowCell(this, cell)
  }

  ContentState.prototype.docArrowHandler = function (event) {
    return docArrowHandler(this, event)
  }

  ContentState.prototype.arrowHandler = function (event) {
    return arrowHandler(this, event)
  }
}

export default arrowCtrl
