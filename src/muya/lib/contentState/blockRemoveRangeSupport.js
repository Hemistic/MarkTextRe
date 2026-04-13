export const removeBlocks = (contentState, before, after, isRemoveAfter = true, isRecursion = false) => {
  if (!isRecursion) {
    if (/td|th/.test(before.type)) {
      contentState.exemption.add(contentState.closest(before, 'figure'))
    }
    if (/td|th/.test(after.type)) {
      contentState.exemption.add(contentState.closest(after, 'figure'))
    }
  }

  let nextSibling = contentState.getBlock(before.nextSibling)
  let beforeEnd = false
  while (nextSibling) {
    if (nextSibling.key === after.key || contentState.isInclude(nextSibling, after)) {
      beforeEnd = true
      break
    }
    contentState.removeTextOrBlock(nextSibling)
    nextSibling = contentState.getBlock(nextSibling.nextSibling)
  }
  if (!beforeEnd) {
    const parent = contentState.getParent(before)
    if (parent) {
      contentState.removeBlocks(parent, after, false, true)
    }
  }

  let preSibling = contentState.getBlock(after.preSibling)
  let afterEnd = false
  while (preSibling) {
    if (preSibling.key === before.key || contentState.isInclude(preSibling, before)) {
      afterEnd = true
      break
    }
    contentState.removeTextOrBlock(preSibling)
    preSibling = contentState.getBlock(preSibling.preSibling)
  }
  if (!afterEnd) {
    const parent = contentState.getParent(after)
    if (parent) {
      const removeAfter = isRemoveAfter && contentState.isOnlyRemoveableChild(after)
      contentState.removeBlocks(before, parent, removeAfter, true)
    }
  }

  if (isRemoveAfter) {
    contentState.removeTextOrBlock(after)
  }
  if (!isRecursion) {
    contentState.exemption.clear()
  }
}
