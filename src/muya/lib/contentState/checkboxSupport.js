import { CLASS_OR_ID } from '../config'
import { getParentCheckBox } from '../utils/getParentCheckBox'
import { cumputeCheckboxStatus } from '../utils/cumputeCheckBoxStatus'
import { getContentStateOptions } from './runtimeOptionSupport'

export const setCheckBoxState = (contentState, checkbox, checked) => {
  checkbox.checked = checked
  const block = contentState.getBlock(checkbox.id)
  block.checked = checked
  checkbox.classList.toggle(CLASS_OR_ID.AG_CHECKBOX_CHECKED)
}

export const updateParentsCheckBoxState = (contentState, checkbox) => {
  let parent = getParentCheckBox(checkbox)
  while (parent !== null) {
    const checked = cumputeCheckboxStatus(parent)
    if (parent.checked !== checked) {
      contentState.setCheckBoxState(parent, checked)
      parent = getParentCheckBox(parent)
    } else {
      break
    }
  }
}

export const updateChildrenCheckBoxState = (contentState, checkbox, checked) => {
  const checkboxes = checkbox.parentElement.querySelectorAll(`input ~ ul .${CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX}`)
  for (let i = 0; i < checkboxes.length; i++) {
    const currentCheckbox = checkboxes[i]
    if (currentCheckbox.checked !== checked) {
      contentState.setCheckBoxState(currentCheckbox, checked)
    }
  }
}

export const listItemCheckBoxClick = (contentState, checkbox) => {
  const { checked } = checkbox
  contentState.setCheckBoxState(checkbox, checked)

  const { autoCheck } = getContentStateOptions(contentState)
  if (autoCheck) {
    contentState.updateChildrenCheckBoxState(checkbox, checked)
    contentState.updateParentsCheckBoxState(checkbox)
  }

  const block = contentState.getBlock(checkbox.id)
  const parentBlock = contentState.getParent(block)
  const firstEditableBlock = contentState.firstInDescendant(parentBlock)
  const { key } = firstEditableBlock
  const offset = 0
  contentState.cursor = { start: { key, offset }, end: { key, offset } }
  return contentState.partialRender()
}
