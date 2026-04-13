
export const updateAtxHeader = (contentState, block, header, line) => {
  const newType = `h${header.length}`
  const headingStyle = 'atx'
  if (block.type === newType && block.headingStyle === headingStyle) {
    return null
  }

  const text = line.text
  const lines = text.split('\n')
  const preParagraphLines = []
  let atxLine = ''
  const postParagraphLines = []
  let atxLineHasPushed = false

  for (const currentLine of lines) {
    if (/^ {0,3}#{1,6}(?=\s{1,}|$)/.test(currentLine) && !atxLineHasPushed) {
      atxLine = currentLine
      atxLineHasPushed = true
    } else if (!atxLineHasPushed) {
      preParagraphLines.push(currentLine)
    } else {
      postParagraphLines.push(currentLine)
    }
  }

  const atxBlock = contentState.createBlock(newType, {
    headingStyle
  })
  const atxLineBlock = contentState.createBlock('span', {
    text: atxLine,
    functionType: 'atxLine'
  })
  contentState.appendChild(atxBlock, atxLineBlock)
  contentState.insertBefore(atxBlock, block)

  if (preParagraphLines.length) {
    const preBlock = contentState.createBlockP(preParagraphLines.join('\n'))
    contentState.insertBefore(preBlock, atxBlock)
  }
  if (postParagraphLines.length) {
    const postBlock = contentState.createBlockP(postParagraphLines.join('\n'))
    contentState.insertAfter(postBlock, atxBlock)
  }

  contentState.removeBlock(block)

  const { start, end } = contentState.cursor
  const key = atxBlock.children[0].key
  contentState.cursor = {
    start: { key, offset: start.offset },
    end: { key, offset: end.offset }
  }

  return atxBlock
}
