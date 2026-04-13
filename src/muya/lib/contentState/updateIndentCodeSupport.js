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
