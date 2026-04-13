import { getContentStateEditor } from './runtimeDomSupport'
import {
  getContentStateStateRender,
  getStateRenderContainer
} from './runtimeRenderAccessSupport'

export const hasCursorEndpoints = cursor => {
  const anchor = cursor && (cursor.anchor || cursor.start)
  const focus = cursor && (cursor.focus || cursor.end)
  const start = cursor && (cursor.start || anchor)
  const end = cursor && (cursor.end || focus)

  return !!(
    cursor &&
    anchor &&
    focus &&
    start &&
    end &&
    anchor.key &&
    focus.key &&
    start.key &&
    end.key
  )
}

export const normalizeCursorEndpoints = cursor => {
  if (!cursor || !hasCursorEndpoints(cursor)) {
    return null
  }

  const anchor = cursor.anchor || cursor.start
  const focus = cursor.focus || cursor.end
  const start = cursor.start || anchor
  const end = cursor.end || focus

  return {
    ...cursor,
    anchor,
    focus,
    start,
    end
  }
}

export const hasCursorBlocks = (contentState, cursor = contentState.cursor) => {
  const normalizedCursor = normalizeCursorEndpoints(cursor)
  if (!normalizedCursor) {
    return false
  }

  return !!(
    contentState.getBlock(normalizedCursor.start.key) &&
    contentState.getBlock(normalizedCursor.end.key)
  )
}

export const isConnectedNode = node => {
  return !!node && node.isConnected !== false
}

export const getCursorRestoreContext = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  const renderContainer = getStateRenderContainer(stateRender)
  const editor = getContentStateEditor(contentState)

  return {
    renderContainer,
    editor
  }
}

export const shouldRestoreContentCursor = (contentState) => {
  if (!hasCursorBlocks(contentState)) {
    return false
  }

  const { renderContainer, editor } = getCursorRestoreContext(contentState)

  if (!isConnectedNode(renderContainer) || !isConnectedNode(editor)) {
    return false
  }

  return true
}

export const resolveRenderCursorAction = (contentState, isRenderCursor = true) => {
  if (!isRenderCursor) {
    return 'blur'
  }

  return shouldRestoreContentCursor(contentState)
    ? 'restore'
    : 'skip'
}

export const applyResolvedRenderCursorAction = (
  contentState,
  action,
  restoreCursor,
  blurContentState
) => {
  if (action === 'restore') {
    if (restoreCursor(contentState) !== false) {
      return 'restore'
    }

    return 'skip'
  }

  if (action === 'blur') {
    blurContentState(contentState)
    return 'blur'
  }

  return 'skip'
}
