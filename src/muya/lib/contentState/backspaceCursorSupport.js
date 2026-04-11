import selection from '../selection'
import { getImageInfo } from '../utils/getImageInfo'
import { applyInlineDegrade } from './backspaceSupport'

const setCursor = (contentState, key, offset) => {
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const handleInlineImageBackspace = (contentState, event, context, startBlock, start) => {
  const { node, parentNode, right } = context
  if (parentNode && parentNode.classList && parentNode.classList.contains('ag-inline-image')) {
    if (selection.getCaretOffsets(node).left === 0) {
      event.preventDefault()
      event.stopPropagation()
      const imageInfo = getImageInfo(parentNode)
      contentState.deleteImage(imageInfo)
      return true
    }
    if (selection.getCaretOffsets(node).left === 1 && right === 0) {
      event.stopPropagation()
      event.preventDefault()
      const text = startBlock.text
      startBlock.text = text.substring(0, start.offset - 1) + text.substring(start.offset)
      setCursor(contentState, startBlock.key, start.offset - 1)
      contentState.singleRender(startBlock)
      return true
    }
  }

  if (node && node.classList && node.classList.contains('ag-image-container')) {
    const imageWrapper = node.parentNode
    const imageInfo = getImageInfo(imageWrapper)
    if (start.offset === imageInfo.token.range.end) {
      event.preventDefault()
      event.stopPropagation()
      contentState.selectImage(imageInfo)
      return true
    }
  }

  return false
}

export const handleCellBoundaryBackspace = (contentState, event, startBlock, left, right) => {
  if (startBlock.functionType === 'cellContent' && /<br\/>.{1}$/.test(startBlock.text)) {
    event.preventDefault()
    event.stopPropagation()
    startBlock.text = startBlock.text.substring(0, startBlock.text.length - 1)
    setCursor(contentState, startBlock.key, startBlock.text.length)
    contentState.singleRender(startBlock)
    return true
  }

  if (startBlock.functionType === 'cellContent' && left === 1 && right === 0) {
    event.stopPropagation()
    event.preventDefault()
    startBlock.text = ''
    setCursor(contentState, startBlock.key, 0)
    contentState.singleRender(startBlock)
    return true
  }

  return false
}

export const handleFootnoteBackspace = (contentState, event, block, parent, preBlock, left) => {
  if (
    block.type === 'span' &&
    block.functionType === 'paragraphContent' &&
    left === 0 &&
    preBlock &&
    preBlock.functionType === 'footnoteInput'
  ) {
    event.preventDefault()
    event.stopPropagation()
    if (!parent.nextSibling) {
      const pBlock = contentState.createBlockP(block.text)
      const figureBlock = contentState.closest(block, 'figure')
      contentState.insertBefore(pBlock, figureBlock)
      contentState.removeBlock(figureBlock)
      setCursor(contentState, pBlock.children[0].key, 0)
      contentState.partialRender()
    }
    return true
  }

  return false
}

export const handleCodeBlockStartBackspace = (contentState, event, block, parent, left) => {
  if (
    block.type === 'span' &&
    block.functionType === 'codeContent' &&
    left === 0 &&
    !block.preSibling
  ) {
    event.preventDefault()
    event.stopPropagation()
    if (!block.nextSibling) {
      const preBlock = contentState.getParent(parent)
      const pBlock = contentState.createBlock('p')
      const lineBlock = contentState.createBlock('span', { text: block.text })
      contentState.appendChild(pBlock, lineBlock)
      let referenceBlock = null
      switch (preBlock.functionType) {
        case 'fencecode':
        case 'indentcode':
        case 'frontmatter':
          referenceBlock = preBlock
          break
        case 'multiplemath':
        case 'flowchart':
        case 'mermaid':
        case 'sequence':
        case 'plantuml':
        case 'vega-lite':
        case 'html':
          referenceBlock = contentState.getParent(preBlock)
          break
      }
      contentState.insertBefore(pBlock, referenceBlock)
      contentState.removeBlock(referenceBlock)
      setCursor(contentState, lineBlock.key, 0)
      contentState.partialRender()
    }
    return true
  }

  return false
}

export const handleInlineDegradeBackspace = (contentState, event, block, parent, inlineDegrade) => {
  if (!inlineDegrade) {
    return false
  }

  event.preventDefault()
  applyInlineDegrade(contentState, block, parent, inlineDegrade)
  return true
}

export const handleMergeWithPreviousBackspace = (contentState, event, block, parent, preBlock, left) => {
  if (!(left === 0 && preBlock)) {
    return false
  }

  event.preventDefault()
  const { text } = block
  const key = preBlock.key
  const offset = preBlock.text.length
  preBlock.text += text

  if (contentState.isOnlyChild(block) && block.type === 'span') {
    contentState.removeBlock(parent)
  } else if (block.functionType !== 'languageInput' && block.functionType !== 'footnoteInput') {
    contentState.removeBlock(block)
  }

  setCursor(contentState, key, offset)
  let needRenderAll = false
  if (contentState.isCollapse() && preBlock.type === 'span' && preBlock.functionType === 'paragraphContent') {
    contentState.checkInlineUpdate(preBlock)
    needRenderAll = true
  }

  needRenderAll ? contentState.render() : contentState.partialRender()
  return true
}
