export const initializeContentStateState = contentState => {
  contentState.runtime = {
    destroyed: false,
    stateRenderReady: false
  }
  contentState.exemption = new Set()
  contentState.blocks = [contentState.createBlockP()]
  contentState.stateRender = null
  contentState.renderRange = [null, null]
  contentState.currentCursor = null
  contentState.selectedBlock = null
  contentState._selectedImage = null
  contentState.dropAnchor = null
  contentState.prevCursor = null
  contentState.historyTimer = null
  contentState.dragInfo = null
  contentState.isDragTableBar = false
  contentState.dragEventIds = []
  contentState.cellSelectInfo = null
  contentState._selectedTableCells = null
  contentState.cellSelectEventIds = []
}
