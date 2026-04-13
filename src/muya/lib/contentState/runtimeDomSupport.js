import { getStateRenderContainer } from './runtimeRenderAccessSupport'
import { resolveEditorRoot } from './runtimeDomRootSupport'
import { queryFromRoot } from '../utils/domQuerySupport'
import {
  getNodeDocument,
  getNodeWindow
} from './runtimeDomEnvironmentSupport'

export const getContentStateContainer = contentState => {
  const container = contentState && contentState.muya ? contentState.muya.container : null
  return container && container.isConnected === false ? null : container
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

export { getNodeDocument, getNodeWindow }
