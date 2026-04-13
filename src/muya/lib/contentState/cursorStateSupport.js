export const hasCursorEdgeKey = edge => {
  return !!(edge && edge.key)
}

export const hasCursorRangeKeys = cursorRange => {
  return !!(
    cursorRange &&
    hasCursorEdgeKey(cursorRange.start) &&
    hasCursorEdgeKey(cursorRange.end)
  )
}

export const normalizeCursorRange = cursorRange => {
  if (!hasCursorRangeKeys(cursorRange)) {
    return null
  }

  const start = cursorRange.start
  const end = cursorRange.end
  const anchor = hasCursorEdgeKey(cursorRange.anchor) ? cursorRange.anchor : start
  const focus = hasCursorEdgeKey(cursorRange.focus) ? cursorRange.focus : end

  return {
    anchor,
    focus,
    start,
    end
  }
}

export const resolveCursorRangeBlocks = (contentState, cursorRange) => {
  const normalizedCursorRange = normalizeCursorRange(cursorRange)
  if (!contentState || !normalizedCursorRange) {
    return null
  }

  const { anchor, focus, start, end } = normalizedCursorRange
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (!startBlock || !endBlock) {
    return null
  }

  return {
    anchor,
    focus,
    start,
    end,
    startBlock,
    endBlock
  }
}

export const resolveActiveCursorRange = (contentState, cursorRange) => {
  const liveCursorRange = resolveCursorRangeBlocks(contentState, cursorRange)
  if (liveCursorRange) {
    return liveCursorRange
  }

  return resolveCursorRangeBlocks(contentState, contentState && contentState.cursor)
}
