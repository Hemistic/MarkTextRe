import { getContentStateContainer } from './runtimeDomSupport'

const clearSelectedTableCells = contentState => {
  const container = getContentStateContainer(contentState)
  const selectedCells = container
    ? container.querySelectorAll('.ag-cell-selected')
    : []

  for (const cell of Array.from(selectedCells)) {
    cell.classList.remove('ag-cell-selected')
    cell.classList.remove('ag-cell-border-top')
    cell.classList.remove('ag-cell-border-right')
    cell.classList.remove('ag-cell-border-bottom')
    cell.classList.remove('ag-cell-border-left')
  }
}

const clearSelectedImages = contentState => {
  const container = getContentStateContainer(contentState)
  const selectedImages = container
    ? container.querySelectorAll('.ag-inline-image-selected')
    : []
  for (const img of selectedImages) {
    img.classList.remove('ag-inline-image-selected')
  }
}

export const getRuntimeSnapshot = contentState => {
  const { blocks, renderRange, currentCursor } = contentState
  return {
    blocks,
    renderRange,
    cursor: currentCursor
  }
}

export const syncCursorHistory = (contentState, cursor) => {
  if (cursor.noHistory) {
    return
  }

  if (
    contentState.prevCursor &&
    (
      contentState.prevCursor.start.key !== cursor.start.key ||
      contentState.prevCursor.end.key !== cursor.end.key
    )
  ) {
    contentState.history.push(getRuntimeSnapshot(contentState))
    return
  }

  if (contentState.historyTimer) clearTimeout(contentState.historyTimer)
  contentState.history.pushPending(getRuntimeSnapshot(contentState))

  contentState.historyTimer = setTimeout(() => {
    contentState.history.commitPending()
  }, 2000)
}

export const createRuntimeAccessors = ContentState => ({
  selectedTableCells: {
    get () {
      return this._selectedTableCells
    },
    set (info) {
      if (!info && this._selectedTableCells) {
        clearSelectedTableCells(this)
      }
      this._selectedTableCells = info
    }
  },
  selectedImage: {
    get () {
      return this._selectedImage
    },
    set (image) {
      if (!image && this._selectedImage) {
        clearSelectedImages(this)
      }
      this._selectedImage = image
    }
  }
})
