
export const updateThematicBreak = (contentState, block, marker, line) => {
  if (block.type === 'hr') return null

  const text = line.text
  const lines = text.split('\n')
  const preParagraphLines = []
  let thematicLine = ''
  const postParagraphLines = []
  let thematicLineHasPushed = false

  for (const currentLine of lines) {
    /* eslint-disable no-useless-escape */
    if (/ {0,3}(?:\* *\* *\*|- *- *-|_ *_ *_)[ \*\-\_]*$/.test(currentLine) && !thematicLineHasPushed) {
      /* eslint-enable no-useless-escape */
      thematicLine = currentLine
      thematicLineHasPushed = true
    } else if (!thematicLineHasPushed) {
      preParagraphLines.push(currentLine)
    } else {
      postParagraphLines.push(currentLine)
    }
  }

  const thematicBlock = contentState.createBlock('hr')
  const thematicLineBlock = contentState.createBlock('span', {
    text: thematicLine,
    functionType: 'thematicBreakLine'
  })
  contentState.appendChild(thematicBlock, thematicLineBlock)
  contentState.insertBefore(thematicBlock, block)

  if (preParagraphLines.length) {
    const preBlock = contentState.createBlockP(preParagraphLines.join('\n'))
    contentState.insertBefore(preBlock, thematicBlock)
  }
  if (postParagraphLines.length) {
    const postBlock = contentState.createBlockP(postParagraphLines.join('\n'))
    contentState.insertAfter(postBlock, thematicBlock)
  }

  contentState.removeBlock(block)
  const { start, end } = contentState.cursor
  const key = thematicBlock.children[0].key
  const preParagraphLength = preParagraphLines.reduce((acc, item) => acc + item.length + 1, 0)
  const startOffset = start.offset - preParagraphLength
  const endOffset = end.offset - preParagraphLength

  contentState.cursor = {
    start: { key, offset: startOffset },
    end: { key, offset: endOffset }
  }

  return thematicBlock
}
