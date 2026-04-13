import { findNearestParagraph, findOutMostParagraph } from '../selection/dom'
import { verticalPositionInRect } from '../utils'
import {
  getContentStateContainer,
  queryContentState
} from './runtimeDomSupport'

export const GHOST_ID = 'mu-dragover-ghost'
const GHOST_HEIGHT = 3

const getGhostDocument = contentState => {
  const container = getContentStateContainer(contentState)
  return container && container.ownerDocument
    ? container.ownerDocument
    : document
}

export const hideGhost = contentState => {
  contentState.dropAnchor = null
  const ghost = getGhostDocument(contentState).getElementById(GHOST_ID)
  ghost && ghost.remove()
}

export const createGhost = (contentState, event) => {
  const target = event.target
  let ghost = null
  const nearestParagraph = findNearestParagraph(target)
  const outmostParagraph = findOutMostParagraph(target)

  if (!outmostParagraph) {
    return hideGhost(contentState)
  }

  const block = contentState.getBlock(nearestParagraph.id)
  let anchor = contentState.getAnchor(block)

  if (!anchor && outmostParagraph) {
    anchor = contentState.getBlock(outmostParagraph.id)
  }

  if (anchor) {
    const anchorParagraph = queryContentState(contentState, `#${anchor.key}`)
    if (!anchorParagraph) {
      return hideGhost(contentState)
    }
    const rect = anchorParagraph.getBoundingClientRect()
    const position = verticalPositionInRect(event, rect)
    contentState.dropAnchor = {
      position,
      anchor
    }

    const ghostDocument = getGhostDocument(contentState)
    ghost = ghostDocument.getElementById(GHOST_ID)
    if (!ghost) {
      ghost = ghostDocument.createElement('div')
      ghost.id = GHOST_ID
      ghostDocument.body.appendChild(ghost)
    }

    Object.assign(ghost.style, {
      width: `${rect.width}px`,
      left: `${rect.left}px`,
      top: position === 'up' ? `${rect.top - GHOST_HEIGHT}px` : `${rect.top + rect.height}px`
    })
  }
}
