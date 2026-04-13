import {
  createPreAndPreview,
  createContainerBlock,
  initContainerBlock
} from './containerCreateSupport'

export { createPreAndPreview, createContainerBlock, initContainerBlock }

export const handleContainerBlockClick = (contentState, figureEle) => {
  const { id } = figureEle
  const mathBlock = contentState.getBlock(id)
  const preBlock = mathBlock.children[0]
  const firstLine = preBlock.children[0].children[0]

  const { key } = firstLine
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
}

export const updateMathBlock = (contentState, block) => {
  const functionType = 'multiplemath'
  const { type } = block

  if (type === 'span' && block.functionType === 'paragraphContent') {
    const isMathBlock = !!block.text.match(/^`{3,}math\s*/)
    if (isMathBlock) {
      const result = initContainerBlock(contentState, functionType, block, 'gitlab')
      if (result) {
        const { key } = result
        const offset = 0
        contentState.cursor = {
          start: { key, offset },
          end: { key, offset }
        }

        contentState.partialRender()
        return result
      }
    }
    return false
  } else if (type !== 'p') {
    return false
  }

  const { text } = block.children[0]
  return text.trim() === '$$' ? initContainerBlock(contentState, functionType, block, '') : false
}
