
export const insertHtmlBlock = (contentState, block) => {
  if (block.type === 'span') {
    block = contentState.getParent(block)
  }
  const preBlock = contentState.initHtmlBlock(block)
  const cursorBlock = contentState.firstInDescendant(preBlock)
  const { key, text } = cursorBlock
  const match = /^[^\n]+\n[^\n]*/.exec(text)
  const offset = match && match[0] ? match[0].length : 0

  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
