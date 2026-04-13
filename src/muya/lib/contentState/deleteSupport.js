import selection from '../selection'
import { resolveActiveCursorRange } from './cursorStateSupport'

export const docDeleteHandler = (contentState, event) => {
  const { selectedImage } = contentState
  if (selectedImage) {
    event.preventDefault()
    contentState.selectedImage = null
    return contentState.deleteImage(selectedImage)
  }

  if (contentState.selectedTableCells) {
    event.preventDefault()
    return contentState.deleteSelectedTableCells()
  }
}

export const deleteHandler = (contentState, event) => {
  const cursorContext = resolveActiveCursorRange(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return
  }

  const { start, end, startBlock } = cursorContext
  const nextBlock = contentState.findNextBlockInLocation(startBlock)

  if (startBlock.type === 'figure') event.preventDefault()
  if (start.key !== end.key || start.offset !== end.offset) {
    return
  }

  const { type, text, key } = startBlock
  if (/span/.test(type) && start.offset === 0 && text[1] === '\n') {
    event.preventDefault()
    startBlock.text = text.substring(2)
    contentState.cursor = {
      start: { key, offset: 0 },
      end: { key, offset: 0 }
    }
    return contentState.singleRender(startBlock)
  }

  if (/h\d|span/.test(type) && start.offset === text.length) {
    event.preventDefault()
    if (nextBlock && /h\d|span/.test(nextBlock.type)) {
      if (nextBlock.functionType === 'codeContent' && startBlock.functionType === 'languageInput') {
        return
      }

      startBlock.text += nextBlock.text

      const toBeRemoved = [nextBlock]
      let parent = contentState.getParent(nextBlock)
      let target = nextBlock

      while (contentState.isOnlyRemoveableChild(target)) {
        toBeRemoved.push(parent)
        target = parent
        parent = contentState.getParent(parent)
      }

      toBeRemoved.forEach(b => contentState.removeBlock(b))

      const offset = start.offset
      contentState.cursor = {
        start: { key, offset },
        end: { key, offset }
      }
      contentState.render()
    }
  }
}
