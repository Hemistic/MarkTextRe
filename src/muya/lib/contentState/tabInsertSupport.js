
export const insertTab = contentState => {
  const tabSize = contentState.tabSize
  const tabCharacter = String.fromCharCode(160).repeat(tabSize)
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (start.key === end.key && start.offset === end.offset) {
    startBlock.text = startBlock.text.substring(0, start.offset) +
      tabCharacter + endBlock.text.substring(end.offset)
    const key = start.key
    const offset = start.offset + tabCharacter.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    return contentState.partialRender()
  }
}
