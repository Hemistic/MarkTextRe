import selection from '../selection'
import { generator } from '../parser/'
import { clearFormat } from './formatTokenSupport'

export const clearBlockFormat = (contentState, block, { start, end } = selection.getCursorRange(), type) => {
  if (!start || !end) {
    return
  }
  if (block.type === 'pre') return false
  const { key } = block
  let tokens
  let neighbors
  if (start.key === end.key && start.key === key) {
    ({ tokens, neighbors } = contentState.selectionFormats({ start, end }))
  } else if (start.key !== end.key && start.key === key) {
    ({ tokens, neighbors } = contentState.selectionFormats({ start, end: { key: start.key, offset: block.text.length } }))
  } else if (start.key !== end.key && end.key === key) {
    ({ tokens, neighbors } = contentState.selectionFormats({
      start: {
        key: end.key,
        offset: 0
      },
      end
    }))
  } else {
    ({ tokens, neighbors } = contentState.selectionFormats({
      start: {
        key,
        offset: 0
      },
      end: {
        key,
        offset: block.text.length
      }
    }))
  }

  neighbors = type
    ? neighbors.filter(neighbor => {
      return neighbor.type === type ||
        (neighbor.type === 'html_tag' && neighbor.tag === type)
    })
    : neighbors

  for (const neighbor of neighbors) {
    clearFormat(neighbor, { start, end })
  }
  start.offset += start.delata
  end.offset += end.delata
  block.text = generator(tokens)
}
