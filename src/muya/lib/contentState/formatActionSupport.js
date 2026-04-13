import selection from '../selection'
import { formatMultiBlock } from './formatMultiBlockSupport'
import { formatSingleBlock } from './formatSingleBlockSupport'

export const format = (contentState, type) => {
  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }

  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  start.delata = 0
  end.delata = 0

  if (start.key === end.key) {
    return formatSingleBlock(contentState, type, startBlock, start, end)
  }

  return formatMultiBlock(contentState, type, startBlock, endBlock, start, end)
}
