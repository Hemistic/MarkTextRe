import { CLASS_OR_ID } from '../config'
import { getStateRenderContainer } from './runtimeRenderAccessSupport'
import {
  getGlobalDocument,
  matchesSelector,
  queryFromRoot
} from '../utils/domQuerySupport'

const resolveEditorRoot = container => {
  if (!container) {
    return null
  }

  if (matchesSelector(container, `#${CLASS_OR_ID.AG_EDITOR_ID}`)) {
    return container
  }

  if (typeof container.querySelector === 'function') {
    return container.querySelector(`#${CLASS_OR_ID.AG_EDITOR_ID}`) || container.firstElementChild || container
  }

  return null
}

export const getContentStateContainer = contentState => {
  const container = contentState && contentState.muya ? contentState.muya.container : null
  return container && container.isConnected === false ? null : container
}

export const getNodeDocument = node => {
  return node && node.ownerDocument
    ? node.ownerDocument
    : getGlobalDocument()
}

export const getNodeWindow = node => {
  const doc = getNodeDocument(node)
  return doc && doc.defaultView
    ? doc.defaultView
    : (typeof window !== 'undefined' ? window : null)
}

export const getContentStateDocument = contentState => {
  return getNodeDocument(getContentStateContainer(contentState))
}

export const getContentStateWindow = contentState => {
  return getNodeWindow(getContentStateContainer(contentState))
}

export const getContentStateEditor = contentState => {
  return resolveEditorRoot(getContentStateContainer(contentState))
}

export const queryContentState = (contentState, selector) => {
  const container = getContentStateContainer(contentState)
  return queryFromRoot(container, selector)
}

export const queryContentStateEditor = (contentState, selector) => {
  const editor = getContentStateEditor(contentState)
  return queryFromRoot(editor, selector)
}

export const getStateRenderEditor = stateRender => {
  const container = getStateRenderContainer(stateRender)
  return resolveEditorRoot(container)
}

export const queryStateRenderEditor = (stateRender, selector) => {
  const editor = getStateRenderEditor(stateRender)
  return queryFromRoot(editor, selector)
}
