const hasClass = (node, className) => {
  return !!(node && node.classList && typeof node.classList.contains === 'function' && node.classList.contains(className))
}

export const isSelectionNodeLike = node => {
  return !!node && typeof node === 'object' && typeof node.nodeType === 'number'
}

export const isConnectedSelectionNode = node => {
  return isSelectionNodeLike(node) && node.isConnected !== false
}

export const canRestoreCursorRange = (cursorRange, anchorParagraph, focusParagraph) => {
  const anchor = cursorRange && (cursorRange.anchor || cursorRange.start)
  const focus = cursorRange && (cursorRange.focus || cursorRange.end)

  return !!(
    anchor &&
    focus &&
    anchor.key &&
    focus.key &&
    isConnectedSelectionNode(anchorParagraph) &&
    isConnectedSelectionNode(focusParagraph)
  )
}

export const shouldClampSelectionOffset = node => {
  return isSelectionNodeLike(node) &&
    (node.nodeType === 3 || (node.nodeType === 1 && !hasClass(node, 'ag-image-container')))
}

export const clampSelectionOffset = (node, offset) => {
  const maxOffset = node && node.nodeType === 1
    ? node.childNodes.length
    : (typeof (node && node.textContent) === 'string' ? node.textContent.length : 0)
  const safeOffset = Number.isFinite(offset) ? offset : 0

  return Math.max(0, Math.min(safeOffset, maxOffset))
}

export const normalizeSelectionTargets = (anchorNode, anchorOffset, focusNode, focusOffset) => {
  if (!isConnectedSelectionNode(anchorNode) || !isConnectedSelectionNode(focusNode)) {
    return null
  }

  return {
    anchorNode,
    anchorOffset: shouldClampSelectionOffset(anchorNode)
      ? clampSelectionOffset(anchorNode, anchorOffset)
      : anchorOffset,
    focusNode,
    focusOffset: shouldClampSelectionOffset(focusNode)
      ? clampSelectionOffset(focusNode, focusOffset)
      : focusOffset
  }
}

export const safeApplySelectionRange = (selection, range) => {
  if (!selection || !range) {
    return false
  }

  try {
    selection.removeAllRanges()
    selection.addRange(range)
    return true
  } catch (error) {
    return false
  }
}

export const safeSetSelectionFocus = (selection, focusNode, focusOffset, doc, selectRange) => {
  if (!selection || !isConnectedSelectionNode(focusNode)) {
    return false
  }

  if (typeof selection.extend === 'function') {
    try {
      selection.extend(focusNode, focusOffset)
      return true
    } catch (error) {
      // Fall through to range-based focus restoration.
    }
  }

  try {
    const range = doc.createRange()
    range.setStart(focusNode, focusOffset)
    range.collapse(true)
    return !!selectRange(range)
  } catch (error) {
    return false
  }
}
