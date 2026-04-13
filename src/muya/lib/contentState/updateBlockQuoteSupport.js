export const updateBlockQuote = (contentState, block, line) => {
  const text = line.text
  const lines = text.split('\n')
  const preParagraphLines = []
  const quoteLines = []
  let quoteLinesHasPushed = false

  for (const currentLine of lines) {
    if (/^ {0,3}>/.test(currentLine) && !quoteLinesHasPushed) {
      quoteLinesHasPushed = true
      quoteLines.push(currentLine.trimStart().substring(1).trimStart())
    } else if (!quoteLinesHasPushed) {
      preParagraphLines.push(currentLine)
    } else {
      quoteLines.push(currentLine)
    }
  }

  let quoteParagraphBlock
  if (/^h\d/.test(block.type)) {
    quoteParagraphBlock = contentState.createBlock(block.type, {
      headingStyle: block.headingStyle
    })
    if (block.headingStyle === 'setext') {
      quoteParagraphBlock.marker = block.marker
    }
    const headerContent = contentState.createBlock('span', {
      text: quoteLines.join('\n'),
      functionType: block.headingStyle === 'setext' ? 'paragraphContent' : 'atxLine'
    })
    contentState.appendChild(quoteParagraphBlock, headerContent)
  } else {
    quoteParagraphBlock = contentState.createBlockP(quoteLines.join('\n'))
  }

  const quoteBlock = contentState.createBlock('blockquote')
  contentState.appendChild(quoteBlock, quoteParagraphBlock)
  contentState.insertBefore(quoteBlock, block)

  if (preParagraphLines.length) {
    const preParagraphBlock = contentState.createBlockP(preParagraphLines.join('\n'))
    contentState.insertBefore(preParagraphBlock, quoteBlock)
  }

  contentState.removeBlock(block)

  const key = quoteParagraphBlock.children[0].key
  const { start, end } = contentState.cursor
  contentState.cursor = {
    start: { key, offset: Math.max(0, start.offset - 1) },
    end: { key, offset: Math.max(0, end.offset - 1) }
  }

  return quoteBlock
}
