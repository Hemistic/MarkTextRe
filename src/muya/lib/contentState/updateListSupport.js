import { updateTaskListItem } from './updateTaskListSupport'
import {
  getListMarkerOrDelimiter,
  splitListItemLines
} from './updateListLineSupport'
import { mergeOrCreateList } from './updateListMergeSupport'
import { getContentStateOptions } from './runtimeOptionSupport'
const TASK_LIST_REG = /^\[[x ]\] {1,4}/i

export const updateList = (contentState, block, type, marker = '', line) => {
  const cleanMarker = marker ? marker.trim() : null
  const { preferLooseListItem } = getContentStateOptions(contentState)
  const wrapperTag = type === 'order' ? 'ol' : 'ul'
  const { start, end } = contentState.cursor
  const startOffset = start.offset
  const endOffset = end.offset
  const newListItemBlock = contentState.createBlock('li')
  const text = line.text
  const lines = text.split('\n')

  const { preParagraphLines, listItemLines } = splitListItemLines(lines, marker)

  const pBlock = contentState.createBlockP(listItemLines.join('\n'))
  contentState.insertBefore(pBlock, block)

  if (preParagraphLines.length > 0) {
    const preParagraphBlock = contentState.createBlockP(preParagraphLines.join('\n'))
    contentState.insertBefore(preParagraphBlock, pBlock)
  }

  contentState.removeBlock(block)
  block = pBlock

  newListItemBlock.listItemType = type
  newListItemBlock.isLooseListItem = preferLooseListItem

  const bulletMarkerOrDelimiter = getListMarkerOrDelimiter(contentState, type, marker, cleanMarker)
  newListItemBlock.bulletMarkerOrDelimiter = bulletMarkerOrDelimiter

  mergeOrCreateList(contentState, block, newListItemBlock, wrapperTag, bulletMarkerOrDelimiter, cleanMarker)

  contentState.appendChild(newListItemBlock, block)
  const listItemText = block.children[0].text
  const { key } = block.children[0]
  const delta = marker.length + preParagraphLines.join('\n').length + 1
  contentState.cursor = {
    start: {
      key,
      offset: Math.max(0, startOffset - delta)
    },
    end: {
      key,
      offset: Math.max(0, endOffset - delta)
    }
  }

  if (TASK_LIST_REG.test(listItemText)) {
    const match = TASK_LIST_REG.exec(listItemText)
    const tasklist = match ? match[0] : ''
    return updateTaskListItem(contentState, block, 'tasklist', tasklist)
  } else {
    return block
  }
}
