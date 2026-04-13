export const updateToParagraph = (contentState, block, line) => {
  if (/^h\d$/.test(block.type) && block.headingStyle === 'setext') {
    return null
  }

  if (block.type !== 'p') {
    const newBlock = contentState.createBlockP(line.text)
    contentState.insertBefore(newBlock, block)
    contentState.removeBlock(block)
    const { start, end } = contentState.cursor
    const key = newBlock.children[0].key
    contentState.cursor = {
      start: { key, offset: start.offset },
      end: { key, offset: end.offset }
    }
    return block
  }

  return null
}
