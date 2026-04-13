import { dispatchContentStateSelectionAndChange } from './runtimeEventSupport'

export const setBackspaceCursor = (contentState, key, offset) => {
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const handleDocBackspace = (contentState, event) => {
  if (contentState.selectedImage) {
    event.preventDefault()
    contentState.deleteImage(contentState.selectedImage)
    return true
  }
  if (contentState.selectedTableCells) {
    event.preventDefault()
    contentState.deleteSelectedTableCells()
    return true
  }
  return false
}

export const handleSelectionBackspace = (contentState, event) => {
  if (contentState.selectedImage) {
    event.preventDefault()
    contentState.deleteImage(contentState.selectedImage)
    return true
  }

  if (contentState.isSelectAll()) {
    event.preventDefault()
    contentState.blocks = [contentState.createBlockP()]
    contentState.init()
    contentState.render()
    dispatchContentStateSelectionAndChange(contentState)
    return true
  }

  return false
}
