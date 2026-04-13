import selection from '../selection'
import { getContentStateOptions } from './runtimeOptionSupport'
import { shouldRestoreContentCursor } from './renderCursorRestoreSupport'
import {
  getContentStateContainer,
} from './runtimeDomSupport'
import {
  restoreCursorRange,
  scheduleCursorRestore
} from './renderCursorFocusSupport'

export const initContentState = contentState => {
  const lastBlock = contentState.getLastBlock()
  const { key, text } = lastBlock
  const offset = text.length

  contentState.searchMatches = {
    value: '',
    matches: [],
    index: -1
  }
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const getHistoryState = contentState => {
  const { stack, index } = contentState.history
  return { stack, index }
}

export const setHistoryState = (contentState, { stack, index }) => {
  Object.assign(contentState.history, { stack, index })
}

export const setContentCursor = contentState => {
  if (!shouldRestoreContentCursor(contentState)) {
    return false
  }

  const container = getContentStateContainer(contentState)
  const previousScrollTop = container ? container.scrollTop : null
  const restored = restoreCursorRange(contentState, previousScrollTop)
  if (!restored) {
    scheduleCursorRestore(contentState, previousScrollTop)
    return false
  }

  return true
}

export const setNextRenderRange = contentState => {
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (!startBlock || !endBlock) {
    contentState.renderRange = [null, null]
    return
  }

  const startOutMostBlock = contentState.findOutMostBlock(startBlock)
  const endOutMostBlock = contentState.findOutMostBlock(endBlock)
  if (!startOutMostBlock || !endOutMostBlock) {
    contentState.renderRange = [null, null]
    return
  }

  contentState.renderRange = [startOutMostBlock.preSibling, endOutMostBlock.nextSibling]
}

export const getPositionReference = contentState => {
  const { fontSize, lineHeight } = getContentStateOptions(contentState)
  const { start } = contentState.cursor
  const block = contentState.getBlock(start.key)
  const { x, y, width } = selection.getCursorCoords()
  const height = fontSize * lineHeight
  const bottom = y + height
  const right = x + width
  const left = x
  const top = y

  return {
    getBoundingClientRect () {
      return { x, y, top, left, right, bottom, height, width }
    },
    clientWidth: width,
    clientHeight: height,
    id: block ? block.key : null
  }
}
