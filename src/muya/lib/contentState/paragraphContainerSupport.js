
export const insertContainerBlock = (contentState, functionType, block) => {
  const anchor = contentState.getAnchor(block)
  if (!anchor) {
    console.error('Can not find the anchor paragraph to insert paragraph')
    return
  }

  const value = anchor.type === 'p'
    ? anchor.children.map(child => child.text).join('\n').trim()
    : ''

  const containerBlock = contentState.createContainerBlock(functionType, value)
  contentState.insertAfter(containerBlock, anchor)
  if (anchor.type === 'p') {
    contentState.removeBlock(anchor)
  }

  const cursorBlock = containerBlock.children[0].children[0].children[0]
  const { key } = cursorBlock
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
