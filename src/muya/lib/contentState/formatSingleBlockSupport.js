import { generator } from '../parser/'
import { addFormat, clearFormat } from './formatTokenSupport'
import { maybeOpenImageSelector } from './formatImageSupport'

export const formatSingleBlock = (contentState, type, startBlock, start, end) => {
  const { formats, tokens, neighbors } = contentState.selectionFormats()
  const currentFormats = formats.filter(formatToken => {
    return formatToken.type === type ||
      (formatToken.type === 'html_tag' && formatToken.tag === type)
  }).reverse()
  const currentNeighbors = neighbors.filter(formatToken => {
    return formatToken.type === type ||
      (formatToken.type === 'html_tag' && formatToken.tag === type)
  }).reverse()

  if (type === 'clear') {
    for (const neighbor of neighbors) {
      clearFormat(neighbor, { start, end })
    }
    start.offset += start.delata
    end.offset += end.delata
    startBlock.text = generator(tokens)
  } else if (currentFormats.length) {
    for (const token of currentFormats) {
      clearFormat(token, { start, end })
    }
    start.offset += start.delata
    end.offset += end.delata
    startBlock.text = generator(tokens)
  } else {
    if (currentNeighbors.length) {
      for (const neighbor of currentNeighbors) {
        clearFormat(neighbor, { start, end })
      }
    }
    start.offset += start.delata
    end.offset += end.delata
    startBlock.text = generator(tokens)
    addFormat(type, startBlock, { start, end })
    if (type === 'image') {
      maybeOpenImageSelector(contentState)
    }
  }

  contentState.cursor = { start, end }
  contentState.partialRender()
}
