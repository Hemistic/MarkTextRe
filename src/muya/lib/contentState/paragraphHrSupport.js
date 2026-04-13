export const insertHorizontalRule = (contentState, block) => {
  const { text } = block
  const paragraphBlock = contentState.createBlockP()
  const anchor = block.type === 'span' ? contentState.getParent(block) : block
  const hrBlock = contentState.createBlock('hr')
  const thematicContent = contentState.createBlock('span', {
    functionType: 'thematicBreakLine',
    text: '---'
  })

  contentState.appendChild(hrBlock, thematicContent)
  contentState.insertAfter(hrBlock, anchor)
  contentState.insertAfter(paragraphBlock, hrBlock)

  if (!text) {
    if (block.type === 'span' && contentState.isOnlyChild(block)) {
      contentState.removeBlock(anchor)
    } else {
      contentState.removeBlock(block)
    }
  }

  const { key } = paragraphBlock.children[0]
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
