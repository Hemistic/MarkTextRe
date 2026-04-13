import { CLASS_OR_ID } from '../config'
import {
  getGlobalDocument,
  queryFromRoot,
  resolveConnectedNode
} from '../utils/domQuerySupport'

let selectionRoot = getGlobalDocument()

export const setSelectionRoot = root => {
  selectionRoot = resolveConnectedNode(root)
}

export const getSelectionRoot = () => {
  selectionRoot = resolveConnectedNode(selectionRoot)
  return selectionRoot
}

export const querySelectionRoot = selector => {
  const root = getSelectionRoot()
  const ownerDocument = root && root.ownerDocument
    ? root.ownerDocument
    : getGlobalDocument()
  return queryFromRoot(root, selector, ownerDocument)
}

export const getSelectionEditor = () => {
  return querySelectionRoot(`#${CLASS_OR_ID.AG_EDITOR_ID}`)
}
