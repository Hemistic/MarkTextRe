import { setBackspaceCursor } from './backspaceSelectionHandlerSupport'

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
      setBackspaceCursor(contentState, lineBlock.key, 0)
      contentState.partialRender()
    }
    return true
  }

  return false
}
