import selection from '../selection'

const renderState = ContentState => {
  ContentState.prototype.init = function () {
    const lastBlock = this.getLastBlock()
    const { key, text } = lastBlock
    const offset = text.length
    this.searchMatches = {
      value: '',
      matches: [],
      index: -1
    }
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
  }

  ContentState.prototype.getHistory = function () {
    const { stack, index } = this.history
    return { stack, index }
  }

  ContentState.prototype.setHistory = function ({ stack, index }) {
    Object.assign(this.history, { stack, index })
  }

  ContentState.prototype.setCursor = function () {
    selection.setCursorRange(this.cursor)
  }

  ContentState.prototype.setNextRenderRange = function () {
    const { start, end } = this.cursor
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    const startOutMostBlock = this.findOutMostBlock(startBlock)
    const endOutMostBlock = this.findOutMostBlock(endBlock)

    this.renderRange = [startOutMostBlock.preSibling, endOutMostBlock.nextSibling]
  }

  ContentState.prototype.postRender = function () {
    this.resizeLineNumber()
  }

  ContentState.prototype.render = function (isRenderCursor = true, clearCache = false) {
    const { blocks, searchMatches: { matches, index } } = this
    const activeBlocks = this.getActiveBlocks()
    if (clearCache) {
      this.stateRender.tokenCache.clear()
    }
    matches.forEach((m, i) => {
      m.active = i === index
    })
    this.setNextRenderRange()
    this.stateRender.collectLabels(blocks)
    this.stateRender.render(blocks, activeBlocks, matches)
    if (isRenderCursor) {
      this.setCursor()
    } else {
      this.muya.blur()
    }
    this.postRender()
  }

  ContentState.prototype.partialRender = function (isRenderCursor = true) {
    const { blocks, searchMatches: { matches, index } } = this
    const activeBlocks = this.getActiveBlocks()
    const [startKey, endKey] = this.renderRange
    matches.forEach((m, i) => {
      m.active = i === index
    })

    let startIndex = startKey ? blocks.findIndex(block => block.key === startKey) : 0
    if (startIndex === -1) {
      startIndex = 0
    }

    let endIndex = blocks.length
    if (endKey) {
      const tmpEndIndex = blocks.findIndex(block => block.key === endKey)
      if (tmpEndIndex >= 0) {
        endIndex = tmpEndIndex + 1
      }
    }

    const blocksToRender = blocks.slice(startIndex, endIndex)

    this.setNextRenderRange()
    this.stateRender.collectLabels(blocks)
    this.stateRender.partialRender(blocksToRender, activeBlocks, matches, startKey, endKey)
    if (isRenderCursor) {
      this.setCursor()
    } else {
      this.muya.blur()
    }
    this.postRender()
  }

  ContentState.prototype.singleRender = function (block, isRenderCursor = true) {
    const { blocks, searchMatches: { matches, index } } = this
    const activeBlocks = this.getActiveBlocks()
    matches.forEach((m, i) => {
      m.active = i === index
    })
    this.setNextRenderRange()
    this.stateRender.collectLabels(blocks)
    this.stateRender.singleRender(block, activeBlocks, matches)
    if (isRenderCursor) {
      this.setCursor()
    } else {
      this.muya.blur()
    }
    this.postRender()
  }

  ContentState.prototype.getPositionReference = function () {
    const { fontSize, lineHeight } = this.muya.options
    const { start } = this.cursor
    const block = this.getBlock(start.key)
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

  ContentState.prototype.clear = function () {
    this.history.clearHistory()
  }
}

export default renderState
