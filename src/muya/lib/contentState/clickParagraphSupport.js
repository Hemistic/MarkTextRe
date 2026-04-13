import { isMuyaEditorElement } from '../selection/dom'
import { queryContentState } from './runtimeDomSupport'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleClickBelowLastParagraph = (contentState, event) => {
  const { target } = event
  if (!isMuyaEditorElement(target)) {
    return false
  }

  const lastBlock = contentState.getLastBlock()
  const anchor = contentState.findOutMostBlock(lastBlock)
  const anchorParagraph = queryContentState(contentState, `#${anchor.key}`)
  if (anchorParagraph === null) {
    return false
  }
  const rect = anchorParagraph.getBoundingClientRect()
  if (event.clientY <= rect.top + rect.height) {
    return false
  }

  let needToInsertNewParagraph = false
  if (lastBlock.type === 'span') {
    if (/atxLine|paragraphContent/.test(lastBlock.functionType) && /\S/.test(lastBlock.text)) {
      needToInsertNewParagraph = true
    }
    if (!/atxLine|paragraphContent/.test(lastBlock.functionType)) {
      needToInsertNewParagraph = true
    }
  } else {
    needToInsertNewParagraph = true
  }

  if (needToInsertNewParagraph) {
    event.preventDefault()
    const paragraphBlock = contentState.createBlockP()
    contentState.insertAfter(paragraphBlock, anchor)
    const key = paragraphBlock.children[0].key
    const offset = 0
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.render()
    return true
  }

  return false
}

export const handleFrontMenuClick = (contentState, event) => {
  const { target } = event
  const { start: oldStart, end: oldEnd } = contentState.cursor
  if (!(oldStart && oldEnd)) {
    return false
  }

  let hasSameParent = false
  const startBlock = contentState.getBlock(oldStart.key)
  const endBlock = contentState.getBlock(oldEnd.key)
  if (startBlock && endBlock) {
    const startOutBlock = contentState.findOutMostBlock(startBlock)
    const endOutBlock = contentState.findOutMostBlock(endBlock)
    hasSameParent = startOutBlock === endOutBlock
  }

  if (!(target.closest('.ag-front-icon') && hasSameParent)) {
    return false
  }

  const currentBlock = contentState.findOutMostBlock(startBlock)
  const frontIcon = target.closest('.ag-front-icon')
  const rect = frontIcon.getBoundingClientRect()
  const reference = {
    getBoundingClientRect () {
      return rect
    },
    clientWidth: rect.width,
    clientHeight: rect.height,
    id: currentBlock.key
  }
  contentState.selectedBlock = currentBlock
  dispatchContentStateEvent(contentState, 'muya-front-menu', { reference, outmostBlock: currentBlock, startBlock, endBlock })
  contentState.partialRender()
  return true
}
