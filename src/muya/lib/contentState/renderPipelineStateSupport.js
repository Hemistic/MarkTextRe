import { getContentStateStateRender } from './runtimeRenderAccessSupport'

export const createEmptySearchMatches = () => ({
  matches: [],
  index: -1
})

export const getRenderState = contentState => {
  const stateRender = getContentStateStateRender(contentState)

  if (
    !stateRender ||
    typeof stateRender.collectLabels !== 'function' ||
    typeof stateRender.render !== 'function' ||
    typeof stateRender.partialRender !== 'function' ||
    typeof stateRender.singleRender !== 'function'
  ) {
    return null
  }

  return stateRender
}

export const markSearchMatches = contentState => {
  const { matches, index } = contentState.searchMatches || createEmptySearchMatches()
  matches.forEach((match, matchIndex) => {
    match.active = matchIndex === index
  })
  return matches
}

export const resolveRenderIndices = (blocks, startKey, endKey) => {
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

  return [startIndex, endIndex]
}

export const prepareRenderContext = contentState => {
  const stateRender = getRenderState(contentState)
  if (!stateRender) {
    return null
  }

  return {
    stateRender,
    blocks: contentState.blocks,
    activeBlocks: contentState.getActiveBlocks(),
    matches: markSearchMatches(contentState)
  }
}
