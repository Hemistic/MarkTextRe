import selection from '../selection'
import { selectionFormats, clearBlockFormat, format } from './formatSupport'

const formatCtrl = ContentState => {
  ContentState.prototype.selectionFormats = function ({ start, end } = selection.getCursorRange()) {
    return selectionFormats(this, { start, end })
  }

  ContentState.prototype.clearBlockFormat = function (block, { start, end } = selection.getCursorRange(), type) {
    return clearBlockFormat(this, block, { start, end }, type)
  }

  ContentState.prototype.format = function (type) {
    return format(this, type)
  }
}

export default formatCtrl
