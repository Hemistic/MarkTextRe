export const syncCodeBlockLanguageInput = (contentState, block, lang) => {
  const preBlock = contentState.getParent(block)
  const nextSibling = contentState.getNextSibling(block)

  if (block.text !== lang || preBlock.text !== lang || nextSibling.text !== lang) {
    block.text = lang
    preBlock.lang = lang
    preBlock.functionType = 'fencecode'
    nextSibling.lang = lang
    nextSibling.children.forEach(child => {
      child.lang = lang
    })
  }

  const { key } = nextSibling.children[0]
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const convertParagraphToCodeBlock = (contentState, block, code, language) => {
  const codeBlock = contentState.createBlock('code', {
    lang: language
  })
  const codeContent = contentState.createBlock('span', {
    text: code,
    lang: language,
    functionType: 'codeContent'
  })
  const inputBlock = contentState.createBlock('span', {
    text: language,
    functionType: 'languageInput'
  })

  block.type = 'pre'
  block.functionType = 'fencecode'
  block.lang = language
  block.text = ''
  block.history = null
  block.children = []

  contentState.appendChild(codeBlock, codeContent)
  contentState.appendChild(block, inputBlock)
  contentState.appendChild(block, codeBlock)

  const { key } = codeContent
  const offset = code.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
