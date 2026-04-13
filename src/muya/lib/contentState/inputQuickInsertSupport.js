export const checkQuickInsert = block => {
  const { type, text, functionType } = block
  if (type !== 'span' || functionType !== 'paragraphContent') return false
  return /^@\S*$/.test(text)
}

export const createQuickInsertReference = (contentState, paragraph) => {
  const rect = paragraph.getBoundingClientRect()
  const reference = contentState.getPositionReference()
  reference.getBoundingClientRect = function () {
    const { x, y, left, top, height, bottom } = rect

    return Object.assign({}, {
      left,
      x,
      top,
      y,
      bottom,
      height,
      width: 0,
      right: left
    })
  }

  return reference
}
