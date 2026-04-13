import { getGlobalDocument } from '../utils/domQuerySupport'

export const getNodeDocument = node => {
  return node && node.ownerDocument ? node.ownerDocument : getGlobalDocument()
}

export const getNodeWindow = node => {
  const doc = getNodeDocument(node)
  return doc && doc.defaultView ? doc.defaultView : (typeof window !== 'undefined' ? window : null)
}
