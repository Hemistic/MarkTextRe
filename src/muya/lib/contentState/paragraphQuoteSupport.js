import { selectionChange, getCommonParent } from './paragraphSelectionSupport'

export const handleQuoteMenu = (contentState, insertMode) => {
  const { start, end, affiliation } = selectionChange(contentState, contentState.cursor)
  let startBlock = contentState.getBlock(start.key)
  const isBlockQuote = affiliation.slice(0, 2).filter(block => /blockquote/.test(block.type))

  if (isBlockQuote.length && !insertMode) {
    const quoteBlock = isBlockQuote[0]
    const children = quoteBlock.children
    for (const child of children) {
      contentState.insertBefore(child, quoteBlock)
    }
    contentState.removeBlock(quoteBlock)
    return
  }

  if (start.key === end.key) {
    if (startBlock.type === 'span') {
      startBlock = contentState.getParent(startBlock)
    }
    const quoteBlock = contentState.createBlock('blockquote')
    contentState.insertAfter(quoteBlock, startBlock)
    contentState.removeBlock(startBlock)
    contentState.appendChild(quoteBlock, startBlock)
    return
  }

  const { parent, startIndex, endIndex } = getCommonParent(contentState)
  const children = parent ? parent.children : contentState.blocks
  const referBlock = children[endIndex]
  const quoteBlock = contentState.createBlock('blockquote')

  children.slice(startIndex, endIndex + 1).forEach(child => {
    if (child !== referBlock) {
      contentState.removeBlock(child, children)
    } else {
      contentState.insertAfter(quoteBlock, child)
      contentState.removeBlock(child, children)
    }
    contentState.appendChild(quoteBlock, child)
  })
}
