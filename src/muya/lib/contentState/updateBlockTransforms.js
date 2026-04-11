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

export const updateIndentCode = (contentState, block, line) => {
  const lang = ''
  const codeBlock = contentState.createBlock('code', {
    lang
  })
  const inputBlock = contentState.createBlock('span', {
    functionType: 'languageInput'
  })
  const preBlock = contentState.createBlock('pre', {
    functionType: 'indentcode',
    lang
  })

  const text = line ? line.text : block.text
  const lines = text.split('\n')
  const codeLines = []
  const paragraphLines = []
  let canBeCodeLine = true

  for (const currentLine of lines) {
    if (/^ {4,}/.test(currentLine) && canBeCodeLine) {
      codeLines.push(currentLine.replace(/^ {4}/, ''))
    } else {
      canBeCodeLine = false
      paragraphLines.push(currentLine)
    }
  }

  const codeContent = contentState.createBlock('span', {
    text: codeLines.join('\n'),
    functionType: 'codeContent',
    lang
  })

  contentState.appendChild(codeBlock, codeContent)
  contentState.appendChild(preBlock, inputBlock)
  contentState.appendChild(preBlock, codeBlock)
  contentState.insertBefore(preBlock, block)

  if (paragraphLines.length > 0 && line) {
    const newLine = contentState.createBlock('span', {
      text: paragraphLines.join('\n')
    })
    contentState.insertBefore(newLine, line)
    contentState.removeBlock(line)
  } else {
    contentState.removeBlock(block)
  }

  const key = codeBlock.children[0].key
  const { start, end } = contentState.cursor
  contentState.cursor = {
    start: { key, offset: start.offset - 4 },
    end: { key, offset: end.offset - 4 }
  }

  return preBlock
}

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
