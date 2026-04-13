export const pasteIntoTableCell = (contentState, startBlock, start, end, text) => {
  let isOneCellSelected = false
  if (contentState.selectedTableCells) {
    const { selectedTableCells: stc } = contentState
    if (stc.row === 1 && stc.column === 1) {
      isOneCellSelected = true
    } else {
      contentState.partialRender()
      return true
    }
  }

  const { key } = startBlock
  const pendingText = text.trim().replace(/\n/g, '<br/>')
  let offset = pendingText.length
  if (isOneCellSelected) {
    startBlock.text = pendingText
    contentState.selectedTableCells = null
  } else {
    offset += start.offset
    startBlock.text = startBlock.text.substring(0, start.offset) + pendingText + startBlock.text.substring(end.offset)
  }

  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}
