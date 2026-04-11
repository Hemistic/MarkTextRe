import { HAS_TEXT_BLOCK_REG } from '../config'
import { markdownToState } from '../utils/markdownState'
import { htmlToState } from '../utils/markdownHtml'

export const resolvePasteFragments = async (contentState, type, copyType, text, html) => {
  if (type === 'pasteAsPlainText' || copyType === 'copyAsMarkdown') {
    return markdownToState(contentState, text)
  }

  return htmlToState(contentState, html)
}

const getLastFragmentBlock = blocks => {
  const len = blocks.length
  const lastBlock = blocks[len - 1]

  if (lastBlock.children.length === 0 && HAS_TEXT_BLOCK_REG.test(lastBlock.type)) {
    return lastBlock
  } else if (lastBlock.editable === false) {
    return getLastFragmentBlock(blocks[len - 2].children)
  } else {
    return getLastFragmentBlock(lastBlock.children)
  }
}

const mergeListFragments = (contentState, startBlock, parent, firstFragment, tailFragments) => {
  const listItems = firstFragment.children
  const firstListItem = listItems[0]
  const liChildren = firstListItem.children
  const originListItem = contentState.getParent(parent)
  const originList = contentState.getParent(originListItem)
  const targetListType = firstFragment.children[0].isLooseListItem
  const originListType = originList.children[0].isLooseListItem

  if (targetListType !== originListType) {
    if (!targetListType) {
      firstFragment.children.forEach(item => (item.isLooseListItem = true))
    } else {
      originList.children.forEach(item => (item.isLooseListItem = true))
    }
  }

  if (liChildren[0].type === 'p') {
    startBlock.text += liChildren[0].children[0].text
    const tail = liChildren.slice(1)
    if (tail.length) {
      tail.forEach(block => {
        contentState.appendChild(originListItem, block)
      })
    }
    const firstFragmentTail = listItems.slice(1)
    if (firstFragmentTail.length) {
      firstFragmentTail.forEach(block => {
        contentState.appendChild(originList, block)
      })
    }
  } else {
    listItems.forEach(block => {
      contentState.appendChild(originList, block)
    })
  }

  let target = originList
  tailFragments.forEach(block => {
    contentState.insertAfter(block, target)
    target = block
  })
}

const mergeParagraphFragments = (contentState, startBlock, parent, firstFragment, tailFragments) => {
  const text = firstFragment.children[0].text
  const lines = text.split('\n')
  let target = parent
  if (parent.headingStyle === 'atx') {
    startBlock.text += lines[0]
    if (lines.length > 1) {
      const pBlock = contentState.createBlockP(lines.slice(1).join('\n'))
      contentState.insertAfter(pBlock, parent)
      target = pBlock
    }
  } else {
    startBlock.text += text
  }

  tailFragments.forEach(block => {
    contentState.insertAfter(block, target)
    target = block
  })
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
