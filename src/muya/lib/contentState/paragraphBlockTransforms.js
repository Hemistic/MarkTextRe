import ExportMarkdown from '../utils/exportMarkdown'
import { markdownToState } from '../utils/markdownState'

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

const codeBlockToParagraphs = (contentState, codeBlock) => {
  const codeContent = codeBlock.children[1].children[0].text
  const states = markdownToState(contentState, codeContent)

  for (const state of states) {
    contentState.insertBefore(state, codeBlock)
  }

  contentState.removeBlock(codeBlock)

  const cursorBlock = contentState.firstInDescendant(states[0])
  const { key, text } = cursorBlock
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

const singleParagraphToCodeBlock = (contentState, startBlock) => {
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

const multiParagraphToCodeBlock = (contentState, parent, startIndex, endIndex) => {
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

export const handleCodeBlockMenu = contentState => {
  const { start, end, affiliation } = contentState.selectionChange(contentState.cursor)
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const hasFencedCodeBlockParent = () => {
    return [...startParents, ...endParents].some(block => block.type === 'pre' && /code/.test(block.functionType))
  }

  if (affiliation.length && affiliation[0].type === 'pre' && /code/.test(affiliation[0].functionType)) {
    return codeBlockToParagraphs(contentState, affiliation[0])
  }

  if (start.key === end.key) {
    return singleParagraphToCodeBlock(contentState, startBlock)
  }

  if (!hasFencedCodeBlockParent()) {
    const { parent, startIndex, endIndex } = contentState.getCommonParent()
    return multiParagraphToCodeBlock(contentState, parent, startIndex, endIndex)
  }
}

export const insertContainerBlock = (contentState, functionType, block) => {
  const anchor = contentState.getAnchor(block)
  if (!anchor) {
    console.error('Can not find the anchor paragraph to insert paragraph')
    return
  }

  const value = anchor.type === 'p'
    ? anchor.children.map(child => child.text).join('\n').trim()
    : ''

  const containerBlock = contentState.createContainerBlock(functionType, value)
  contentState.insertAfter(containerBlock, anchor)
  if (anchor.type === 'p') {
    contentState.removeBlock(anchor)
  }

  const cursorBlock = containerBlock.children[0].children[0].children[0]
  const { key } = cursorBlock
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const insertHtmlBlock = (contentState, block) => {
  if (block.type === 'span') {
    block = contentState.getParent(block)
  }
  const preBlock = contentState.initHtmlBlock(block)
  const cursorBlock = contentState.firstInDescendant(preBlock)
  const { key, text } = cursorBlock
  const match = /^[^\n]+\n[^\n]*/.exec(text)
  const offset = match && match[0] ? match[0].length : 0

  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
