import { EVENT_KEYS, CLASS_OR_ID } from '../config'
import selection from '../selection'
import { hideContentStateFloatTools } from './runtimeMuyaSupport'

export const docArrowHandler = (contentState, event) => {
  const { selectedImage } = contentState
  if (!selectedImage) {
    return false
  }

  const { key, token } = selectedImage
  const { start, end } = token.range
  event.preventDefault()
  event.stopPropagation()
  const block = contentState.getBlock(key)
  switch (event.key) {
    case EVENT_KEYS.ArrowUp:
    case EVENT_KEYS.ArrowLeft:
      contentState.cursor = {
        start: { key, offset: start },
        end: { key, offset: start }
      }
      break
    case EVENT_KEYS.ArrowDown:
    case EVENT_KEYS.ArrowRight:
      contentState.cursor = {
        start: { key, offset: end },
        end: { key, offset: end }
      }
      break
  }
  hideContentStateFloatTools(contentState)
  contentState.singleRender(block)
  return true
}

export const handleMathArrowRight = (event, node, start, end) => {
  if (event.key === EVENT_KEYS.ArrowRight && node && node.classList && node.classList.contains(CLASS_OR_ID.AG_MATH_TEXT)) {
    const { right } = selection.getCaretOffsets(node)
    if (right === 0 && start.key === end.key && start.offset === end.offset) {
      selection.select(node.parentNode.nextElementSibling, 0)
      return true
    }
  }
  return false
}

export const shouldIgnoreArrow = (event, start, end) => {
  return (
    (start.key === end.key && start.offset !== end.offset) ||
    start.key !== end.key ||
    event.shiftKey
  )
}

export const canKeepNativeVerticalArrow = (event, block, topOffset, bottomOffset) => {
  if (
    (event.key === EVENT_KEYS.ArrowUp && topOffset > 0) ||
    (event.key === EVENT_KEYS.ArrowDown && bottomOffset > 0)
  ) {
    if (!/pre/.test(block.type) || block.functionType !== 'cellContent') {
      return true
    }
  }
  return false
}
