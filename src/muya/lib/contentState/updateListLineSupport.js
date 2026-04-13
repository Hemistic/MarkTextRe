import { getContentStateOptions } from './runtimeOptionSupport'

const LIST_ITEM_REG = /^ {0,3}(?:[*+-]|\d{1,9}(?:\.|\))) {0,4}/

export const splitListItemLines = (lines, marker) => {
  const preParagraphLines = []
  let listItemLines = []
  let isPushedListItemLine = false

  if (!marker) {
    return {
      preParagraphLines,
      listItemLines: lines
    }
  }

  for (const currentLine of lines) {
    if (LIST_ITEM_REG.test(currentLine) && !isPushedListItemLine) {
      listItemLines.push(currentLine.replace(LIST_ITEM_REG, ''))
      isPushedListItemLine = true
    } else if (!isPushedListItemLine) {
      preParagraphLines.push(currentLine)
    } else {
      listItemLines.push(currentLine)
    }
  }

  return { preParagraphLines, listItemLines }
}

export const getListMarkerOrDelimiter = (contentState, type, marker, cleanMarker) => {
  if (type === 'order') {
    return (cleanMarker && cleanMarker.length >= 2) ? cleanMarker.slice(-1) : '.'
  }

  const { bulletListMarker } = getContentStateOptions(contentState)
  return marker ? marker.charAt(0) : bulletListMarker
}
