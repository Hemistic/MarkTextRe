import { invalidateContentStateImageCache } from './contentState/runtimeRenderAccessSupport'

export const invalidateImageCache = muya => {
  invalidateContentStateImageCache(muya.contentState)
  muya.contentState.render(true)
}

export const undo = muya => {
  muya.contentState.history.undo()

  muya.dispatchSelectionChange()
  muya.dispatchSelectionFormats()
  muya.dispatchChange()
}

export const redo = muya => {
  muya.contentState.history.redo()

  muya.dispatchSelectionChange()
  muya.dispatchSelectionFormats()
  muya.dispatchChange()
}

export const selectAll = muya => {
  if (!muya.hasFocus() && !muya.contentState.selectedTableCells) {
    return
  }
  muya.contentState.selectAll()
}
