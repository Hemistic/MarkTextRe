import {
  clickHandler,
  setCheckBoxState,
  updateParentsCheckBoxState,
  updateChildrenCheckBoxState,
  listItemCheckBoxClick
} from './clickSupport'

const clickCtrl = ContentState => {
  ContentState.prototype.clickHandler = function (event) {
    return clickHandler(this, event)
  }

  ContentState.prototype.setCheckBoxState = function (checkbox, checked) {
    return setCheckBoxState(this, checkbox, checked)
  }

  ContentState.prototype.updateParentsCheckBoxState = function (checkbox) {
    return updateParentsCheckBoxState(this, checkbox)
  }

  ContentState.prototype.updateChildrenCheckBoxState = function (checkbox, checked) {
    return updateChildrenCheckBoxState(this, checkbox, checked)
  }

  // handle task list item checkbox click
  ContentState.prototype.listItemCheckBoxClick = function (checkbox) {
    return listItemCheckBoxClick(this, checkbox)
  }
}

export default clickCtrl
