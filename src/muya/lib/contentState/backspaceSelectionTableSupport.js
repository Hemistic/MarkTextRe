
import { tableHasContent } from './backspaceSupport'
import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

export const handleTableSelectionBackspace = (contentState, event, startBlock, endBlock, startOutmostBlock, endOutmostBlock) => {
  const maybeCell = contentState.getParent(startBlock)
  const maybeLastRow = contentState.getParent(endBlock)
  if (/th/.test(maybeCell.type) && startOutmostBlock && startOutmostBlock === contentState.findOutMostBlock(startBlock) && contentState.cursor.start.offset === 0 && !maybeCell.preSibling) {
    if (
      (
        contentState.cursor.end.offset === endBlock.text.length &&
        startOutmostBlock === endOutmostBlock &&
        !endBlock.nextSibling && !maybeLastRow.nextSibling
      ) ||
      startOutmostBlock !== endOutmostBlock
    ) {
      event.preventDefault()
      const figureBlock = contentState.getBlock(contentState.closest(startBlock, 'figure'))
      const p = contentState.createBlockP(endBlock.text.substring(contentState.cursor.end.offset))
      contentState.insertBefore(p, figureBlock)
      const cursorBlock = p.children[0]
      if (startOutmostBlock !== endOutmostBlock) {
        contentState.removeBlocks(figureBlock, endBlock)
      }
      contentState.removeBlock(figureBlock)
      setBackspaceCursor(contentState, cursorBlock.key, 0)
      contentState.render()
      return true
    }
  }

  return false
}

export const handleTableCellStartBackspace = (contentState, event, block, preBlock, left) => {
  if (!(left === 0 && block.functionType === 'cellContent')) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  const table = contentState.closest(block, 'table')
  const figure = contentState.closest(table, 'figure')
  const hasContent = tableHasContent(table)
  let key
  let offset

  if ((!preBlock || preBlock.functionType !== 'cellContent') && !hasContent) {
    const paragraphContent = contentState.createBlock('span')
    delete figure.functionType
    figure.children = []
    contentState.appendChild(figure, paragraphContent)
    figure.text = ''
    figure.type = 'p'
    key = paragraphContent.key
    offset = 0
  } else if (preBlock) {
    key = preBlock.key
    offset = preBlock.text.length
  }

  if (key !== undefined && offset !== undefined) {
    setBackspaceCursor(contentState, key, offset)
    contentState.partialRender()
  }

  return true
}
