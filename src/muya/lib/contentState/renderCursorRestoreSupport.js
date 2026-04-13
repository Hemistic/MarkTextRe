import { getSelectionRoot } from '../selection/root'
import { getContentStateEditor } from './runtimeDomSupport'
import {
  getContentStateStateRender,
  getStateRenderContainer
} from './runtimeRenderAccessSupport'

export const hasCursorEndpoints = cursor => {
  return !!(
    cursor &&
    cursor.anchor &&
    cursor.focus &&
    cursor.start &&
    cursor.end &&
    cursor.anchor.key &&
    cursor.focus.key &&
    cursor.start.key &&
    cursor.end.key
  )
}

export const hasCursorBlocks = (contentState, cursor = contentState.cursor) => {
  if (!hasCursorEndpoints(cursor)) {
    return false
  }

  return !!(
    contentState.getBlock(cursor.start.key) &&
    contentState.getBlock(cursor.end.key)
  )
}

export const isConnectedNode = node => {
  return !!node && node.isConnected !== false
}

export const isSelectionRootCompatible = (selectionRoot, editor) => {
  if (!selectionRoot || !editor) {
    return false
  }

  if (selectionRoot.nodeType === 9) {
    return true
  }

  if (selectionRoot === editor) {
    return true
  }

  return typeof editor.contains === 'function' && editor.contains(selectionRoot)
}

export const getCursorRestoreContext = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  const renderContainer = getStateRenderContainer(stateRender)
  const editor = getContentStateEditor(contentState)
  const selectionRoot = getSelectionRoot()

  return {
    renderContainer,
    editor,
    selectionRoot
  }
}

export const shouldRestoreContentCursor = (contentState) => {
  if (!hasCursorBlocks(contentState)) {
    return false
  }

  const { renderContainer, editor, selectionRoot } = getCursorRestoreContext(contentState)

  if (!isConnectedNode(renderContainer) || !isConnectedNode(editor)) {
    return false
  }

  if (!isSelectionRootCompatible(selectionRoot, editor)) {
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
