import { markdownToState } from '../utils/markdownState'
import { htmlToState } from '../utils/markdownHtml'
import {
  getLastFragmentBlock,
  mergeListFragments,
  mergeParagraphFragments
} from './pasteFragmentMergeSupport'

export const resolvePasteFragments = async (contentState, type, copyType, text, html) => {
  if (type === 'pasteAsPlainText' || copyType === 'copyAsMarkdown') {
    return markdownToState(contentState, text)
  }

  return htmlToState(contentState, html)
}

export const applyPasteFragments = (
  contentState,
  startBlock,
  endBlock,
  parent,
  stateFragments,
  startOffset,
  endOffset,
  checkPasteType,
  isListType
) => {
  const cacheText = endBlock.text.substring(endOffset)
  startBlock.text = startBlock.text.substring(0, startOffset)

  const firstFragment = stateFragments[0]
  const tailFragments = stateFragments.slice(1)
  const pasteType = checkPasteType(startBlock, firstFragment)
  const lastBlock = getLastFragmentBlock(stateFragments)
  let key = lastBlock.key
  let offset = lastBlock.text.length
  lastBlock.text += cacheText

  switch (pasteType) {
    case 'MERGE':
      if (isListType(firstFragment.type)) {
        mergeListFragments(contentState, startBlock, parent, firstFragment, tailFragments)
      } else if (firstFragment.type === 'p' || /^h\d/.test(firstFragment.type)) {
        mergeParagraphFragments(contentState, startBlock, parent, firstFragment, tailFragments)
      }
      break
    case 'NEWLINE': {
      let target = parent
      stateFragments.forEach(block => {
        contentState.insertAfter(block, target)
        target = block
      })
      if (startBlock.text.length === 0) {
        contentState.removeBlock(parent)
      }
      break
    }
    default:
      throw new Error('unknown paste type')
  }

  let cursorBlock = contentState.getBlock(key)
  if (!cursorBlock) {
    key = startBlock.key
    offset = startBlock.text.length - cacheText.length
    cursorBlock = startBlock
  }

  return {
    cursorBlock,
    cursor: {
      start: { key, offset },
      end: { key, offset }
    }
  }
}
