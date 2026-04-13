
export const updateSetextHeader = (contentState, block, marker, line) => {
  const newType = /=/.test(marker) ? 'h1' : 'h2'
  const headingStyle = 'setext'
  if (block.type === newType && block.headingStyle === headingStyle) {
    return null
  }

  const text = line.text
  const lines = text.split('\n')
  const setextLines = []
  const postParagraphLines = []
  let setextLineHasPushed = false

  for (const currentLine of lines) {
    if (/^ {0,3}(?:={3,}|-{3,})(?= {1,}|$)/.test(currentLine) && !setextLineHasPushed) {
      setextLineHasPushed = true
    } else if (!setextLineHasPushed) {
      setextLines.push(currentLine)
    } else {
      postParagraphLines.push(currentLine)
    }
  }

  const setextBlock = contentState.createBlock(newType, {
    headingStyle,
    marker
  })
  const setextLineBlock = contentState.createBlock('span', {
    text: setextLines.join('\n'),
    functionType: 'paragraphContent'
  })
  contentState.appendChild(setextBlock, setextLineBlock)
  contentState.insertBefore(setextBlock, block)

  if (postParagraphLines.length) {
    const postBlock = contentState.createBlockP(postParagraphLines.join('\n'))
    contentState.insertAfter(postBlock, setextBlock)
  }

  contentState.removeBlock(block)

  const key = setextBlock.children[0].key
  const offset = setextBlock.children[0].text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  return setextBlock
}
