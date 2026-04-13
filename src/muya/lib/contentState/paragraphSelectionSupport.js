import selection from '../selection'
import { PARAGRAPH_TYPES } from '../config'

const createEmptyEdge = () => ({
  key: null,
  offset: 0,
  type: null,
  block: null
})

export const selectionChange = (contentState, cursor) => {
  const selectionRange = cursor || selection.getCursorRange()
  const start = selectionRange && selectionRange.start ? selectionRange.start : createEmptyEdge()
  const end = selectionRange && selectionRange.end ? selectionRange.end : createEmptyEdge()
  if (!start || !end) {
    return {
      start: createEmptyEdge(),
      end: createEmptyEdge(),
      affiliation: [],
      cursorCoords: selection.getCursorCoords()
    }
  }
  const cursorCoords = selection.getCursorCoords()
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (!startBlock || !endBlock) {
    start.type = startBlock ? startBlock.type : null
    start.block = startBlock
    end.type = endBlock ? endBlock.type : null
    end.block = endBlock

    return {
      start,
      end,
      affiliation: [],
      cursorCoords
    }
  }

  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const affiliation = startParents
    .filter(parent => endParents.includes(parent))
    .filter(parent => PARAGRAPH_TYPES.includes(parent.type))

  start.type = startBlock.type
  start.block = startBlock
  end.type = endBlock.type
  end.block = endBlock

  return {
    start,
    end,
    affiliation,
    cursorCoords
  }
}

export const getCommonParent = contentState => {
  const { start, end, affiliation } = selectionChange(contentState)
  const parent = affiliation.length ? affiliation[0] : null
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  if (!startBlock || !endBlock) {
    return { parent: null, startIndex: -1, endIndex: -1 }
  }

  const startParentKeys = contentState.getParents(startBlock).map(block => block.key)
  const endParentKeys = contentState.getParents(endBlock).map(block => block.key)
  const children = parent ? parent.children : contentState.blocks
  let startIndex
  let endIndex

  for (const child of children) {
    if (startParentKeys.includes(child.key)) {
      startIndex = children.indexOf(child)
    }
    if (endParentKeys.includes(child.key)) {
      endIndex = children.indexOf(child)
    }
  }

  return { parent, startIndex, endIndex }
}
