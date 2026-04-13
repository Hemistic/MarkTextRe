import {
  handleSelectionBackspace,
  handleAtxHeadingBackspace,
  handleTokenBackspace,
  handleTableSelectionBackspace,
  handleCellContentSelectionBackspace,
  handleCodeContentBackspace,
  getBackspaceContext,
  handleInlineImageBackspace,
  handleCellBoundaryBackspace,
  handleFootnoteBackspace,
  handleCodeBlockStartBackspace,
  handleTableCellStartBackspace,
  handleInlineDegradeBackspace,
  handleMergeWithPreviousBackspace
} from './backspaceHandlerSupport'

const createFallbackCollapsedContext = (contentState, startBlock, start, context = {}) => {
  const parent = contentState.getParent(startBlock)
  const preBlock = contentState.findPreBlockInLocation(startBlock)
  const left = start.offset
  const right = typeof startBlock.text === 'string' ? startBlock.text.length - start.offset : 0

  return {
    ...context,
    block: startBlock,
    parent,
    preBlock,
    left,
    right
  }
}

export const handleBackspaceSelectionStage = (contentState, event, cursorContext) => {
  const { start, end, startBlock, endBlock } = cursorContext

  if (handleSelectionBackspace(contentState, event)) {
    return true
  }

  if (handleAtxHeadingBackspace(contentState, event, start, end, startBlock)) {
    return true
  }

  if (handleTokenBackspace(contentState, event, startBlock, start, end)) {
    return true
  }

  const startOutmostBlock = contentState.findOutMostBlock(startBlock)
  const endOutmostBlock = contentState.findOutMostBlock(endBlock)
  if (handleTableSelectionBackspace(contentState, event, startBlock, endBlock, startOutmostBlock, endOutmostBlock)) {
    return true
  }

  if (handleCellContentSelectionBackspace(contentState, event, startBlock)) {
    return true
  }

  if (handleCodeContentBackspace(contentState, event, startBlock, endBlock)) {
    return true
  }

  return false
}

export const isCollapsedBackspaceSelection = (start, end) => {
  return start.key === end.key && start.offset === end.offset
}

export const resolveCollapsedBackspaceContext = (contentState, cursorContext) => {
  const { start, startBlock } = cursorContext
  const context = getBackspaceContext(contentState)
  if (context && context.block) {
    return context
  }

  return createFallbackCollapsedContext(contentState, startBlock, start, context)
}

export const handleCollapsedBackspaceStage = (contentState, event, cursorContext, context) => {
  const { start, startBlock } = cursorContext
  const { block, parent, preBlock, left, right, inlineDegrade } = context

  if (!block) {
    return false
  }

  if (handleInlineImageBackspace(contentState, event, context, startBlock, start)) {
    return true
  }

  if (handleCellBoundaryBackspace(contentState, event, startBlock, left, right)) {
    return true
  }

  if (handleFootnoteBackspace(contentState, event, block, parent, preBlock, left)) {
    return true
  }

  if (handleCodeBlockStartBackspace(contentState, event, block, parent, left)) {
    return true
  }

  if (handleTableCellStartBackspace(contentState, event, block, preBlock, left)) {
    return true
  }

  if (handleInlineDegradeBackspace(contentState, event, block, parent, inlineDegrade)) {
    return true
  }

  if (handleMergeWithPreviousBackspace(contentState, event, block, parent, preBlock, left)) {
    return true
  }

  return false
}
