
export const normalizeSelectionBeforeEnter = (contentState, start, end) => {
  const block = contentState.getBlock(start.key)
  if (start.key !== end.key) {
    const endBlock = contentState.getBlock(end.key)
    const key = start.key
    const offset = start.offset
    const startRemainText = block.text.substring(0, start.offset)
    const endRemainText = endBlock.text.substring(end.offset)

    block.text = startRemainText + endRemainText
    contentState.removeBlocks(block, endBlock)
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  if (start.offset !== end.offset) {
    const key = start.key
    const offset = start.offset
    block.text = block.text.substring(0, start.offset) + block.text.substring(end.offset)
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  return false
}

export const handleFootnoteEnter = (contentState, event, block, start, footnoteReg) => {
  const { text } = block
  if (
    block.type === 'span' &&
    block.functionType === 'paragraphContent' &&
    !contentState.getParent(block).parent &&
    start.offset === text.length &&
    footnoteReg.test(text)
  ) {
    event.preventDefault()
    event.stopPropagation()
    block.text += ' '
    const key = block.key
    const offset = block.text.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.updateFootnote(contentState.getParent(block), block)
    return true
  }

  return false
}
