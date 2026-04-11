import selection from '../selection'
import { findNearestParagraph, findOutMostParagraph } from '../selection/dom'
import { tokenizer, generator } from '../parser/'

export const checkBackspaceCase = contentState => {
  const node = selection.getSelectionStart()
  const paragraph = findNearestParagraph(node)
  const outMostParagraph = findOutMostParagraph(node)
  let block = contentState.getBlock(paragraph.id)
  if (block.type === 'span' && block.preSibling) {
    return false
  }
  if (block.type === 'span') {
    block = contentState.getParent(block)
  }
  const preBlock = contentState.getPreSibling(block)
  const outBlock = contentState.findOutMostBlock(block)
  const parent = contentState.getParent(block)

  const { left: outLeft } = selection.getCaretOffsets(outMostParagraph)
  const { left: inLeft } = selection.getCaretOffsets(paragraph)

  if (
    (parent && parent.type === 'li' && inLeft === 0 && contentState.isFirstChild(block)) ||
    (parent && parent.type === 'li' && inLeft === 0 && parent.listItemType === 'task' && preBlock.type === 'input')
  ) {
    if (contentState.isOnlyChild(parent)) {
      return { type: 'LI', info: 'REPLACEMENT' }
    } else if (contentState.isFirstChild(parent)) {
      return { type: 'LI', info: 'REMOVE_INSERT_BEFORE' }
    } else {
      return { type: 'LI', info: 'INSERT_PRE_LIST_ITEM' }
    }
  }
  if (parent && parent.type === 'blockquote' && inLeft === 0) {
    if (contentState.isOnlyChild(block)) {
      return { type: 'BLOCKQUOTE', info: 'REPLACEMENT' }
    } else if (contentState.isFirstChild(block)) {
      return { type: 'BLOCKQUOTE', info: 'INSERT_BEFORE' }
    }
  }
  if (!outBlock.preSibling && outLeft === 0) {
    return { type: 'STOP' }
  }
}

export const handleSpecialBackspaceToken = (contentState, startBlock, start, end) => {
  const { text } = startBlock
  const tokens = tokenizer(text, {
    options: contentState.muya.options
  })
  let needRender = false
  let preToken = null
  for (const token of tokens) {
    if (
      token.range.end === start.offset &&
      token.type === 'inline_math'
    ) {
      needRender = true
      token.raw = token.raw.substr(0, token.raw.length - 1)
      break
    }
    if (
      token.range.start + 1 === start.offset &&
      preToken &&
      preToken.type === 'html_tag' &&
      preToken.tag === 'ruby'
    ) {
      needRender = true
      token.raw = token.raw.substr(1)
      break
    }
    preToken = token
  }
  if (needRender) {
    startBlock.text = generator(tokens)
    start.offset--
    end.offset--
    contentState.cursor = {
      start,
      end
    }
    contentState.partialRender()
    return true
  }

  return false
}

export const tableHasContent = table => {
  const tHead = table.children[0]
  const tBody = table.children[1]
  const tHeadHasContent = tHead.children[0].children.some(th => th.children[0].text.trim())
  const tBodyHasContent = tBody.children.some(row => row.children.some(td => td.children[0].text.trim()))
  return tHeadHasContent || tBodyHasContent
}

export const applyInlineDegrade = (contentState, block, parent, inlineDegrade) => {
  if (block.type === 'span') {
    block = contentState.getParent(block)
    parent = contentState.getParent(parent)
  }

  switch (inlineDegrade.type) {
    case 'STOP':
      break
    case 'LI': {
      if (inlineDegrade.info === 'REPLACEMENT') {
        const children = parent.children
        const grandpa = contentState.getBlock(parent.parent)
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.insertBefore(child, grandpa)
        })
        contentState.removeBlock(grandpa)
      } else if (inlineDegrade.info === 'REMOVE_INSERT_BEFORE') {
        const children = parent.children
        const grandpa = contentState.getBlock(parent.parent)
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.insertBefore(child, grandpa)
        })
        contentState.removeBlock(parent)
      } else if (inlineDegrade.info === 'INSERT_PRE_LIST_ITEM') {
        const parPre = contentState.getBlock(parent.preSibling)
        const children = parent.children
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.appendChild(parPre, child)
        })
        contentState.removeBlock(parent)
      }
      break
    }
    case 'BLOCKQUOTE':
      if (inlineDegrade.info === 'REPLACEMENT') {
        contentState.insertBefore(block, parent)
        contentState.removeBlock(parent)
      } else if (inlineDegrade.info === 'INSERT_BEFORE') {
        contentState.removeBlock(block)
        contentState.insertBefore(block, parent)
      }
      break
  }

  const key = block.type === 'p' ? block.children[0].key : block.key
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  if (inlineDegrade.type !== 'STOP') {
    contentState.partialRender()
  }
}
