export const resolveEnterCursorTarget = cursorBlock => {
  if (!cursorBlock) {
    return null
  }

  const children = Array.isArray(cursorBlock.children) ? cursorBlock.children : []

  if (cursorBlock.type === 'p') {
    return children[0] || cursorBlock
  }

  if (cursorBlock.type === 'pre') {
    const codeBlock = children.find(child => child.type === 'code')
    if (codeBlock && codeBlock.children[0]) {
      return codeBlock.children[0]
    }

    return children[0] || cursorBlock
  }

  return cursorBlock
}

export const isCursorWithinBlock = (contentState, rootBlock, cursor = contentState.cursor) => {
  if (!contentState || !rootBlock || !cursor || !cursor.start || !cursor.start.key) {
    return false
  }

  const cursorBlock = contentState.getBlock(cursor.start.key)
  if (!cursorBlock) {
    return false
  }

  if (cursorBlock.key === rootBlock.key) {
    return true
  }

  return contentState.getParents(cursorBlock).some(block => block.key === rootBlock.key)
}

export const shouldPreserveCodeBlockEnterCursor = (
  contentState,
  blockNeedFocus,
  block,
  getParagraphBlock
) => {
  if (!blockNeedFocus || !block) {
    return false
  }

  const rootBlock = getParagraphBlock(block)
  return isCursorWithinBlock(contentState, rootBlock)
}

export const resolveHtmlEnterOffset = cursorBlock => {
  if (!cursorBlock || typeof cursorBlock.text !== 'string') {
    return 0
  }

  const match = /^[^\n]+\n[^\n]*/.exec(cursorBlock.text)
  return match && match[0] ? match[0].length : 0
}
