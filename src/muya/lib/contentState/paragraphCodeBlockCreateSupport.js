import ExportMarkdown from '../utils/exportMarkdown'

const setCodeInputCursor = (contentState, inputBlock) => {
  const { key } = inputBlock
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

const createFencedCodeBlock = (contentState, text, lang = '') => {
  const preBlock = contentState.createBlock('pre', {
    functionType: 'fencecode',
    lang
  })
  const codeBlock = contentState.createBlock('code', {
    lang
  })
  const inputBlock = contentState.createBlock('span', {
    functionType: 'languageInput'
  })
  const codeContent = contentState.createBlock('span', {
    text,
    lang,
    functionType: 'codeContent'
  })

  contentState.appendChild(codeBlock, codeContent)
  contentState.appendChild(preBlock, inputBlock)
  contentState.appendChild(preBlock, codeBlock)

  return { preBlock, inputBlock }
}

export const singleParagraphToCodeBlock = (contentState, startBlock) => {
  if (startBlock.type !== 'span') {
    contentState.cursor = {
      start: contentState.cursor.start,
      end: contentState.cursor.end
    }
    return
  }

  const anchorBlock = contentState.getParent(startBlock)
  const { preBlock, inputBlock } = createFencedCodeBlock(contentState, startBlock.text)
  contentState.insertBefore(preBlock, anchorBlock)
  contentState.removeBlock(anchorBlock)
  setCodeInputCursor(contentState, inputBlock)
}

export const multiParagraphToCodeBlock = (contentState, parent, startIndex, endIndex) => {
  const children = parent ? parent.children : contentState.blocks
  const referBlock = children[endIndex]
  const { isGitlabCompatibilityEnabled, listIndentation } = contentState
  const markdown = new ExportMarkdown(
    children.slice(startIndex, endIndex + 1),
    listIndentation,
    isGitlabCompatibilityEnabled
  ).generate()

  const { preBlock, inputBlock } = createFencedCodeBlock(contentState, markdown)
  contentState.insertAfter(preBlock, referBlock)

  const removeCache = []
  for (let i = startIndex; i <= endIndex; i++) {
    removeCache.push(children[i])
  }
  removeCache.forEach(block => contentState.removeBlock(block))
  setCodeInputCursor(contentState, inputBlock)
}
