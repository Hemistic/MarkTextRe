import { normalizeClipboardWrapper } from './clipboardSupport'
import { getContentStateDocument } from './runtimeDomSupport'

export const createClipboardWrapper = (contentState, html) => {
  const doc = getContentStateDocument(contentState)
  if (!doc) {
    return null
  }

  const wrapper = doc.createElement('div')
  wrapper.innerHTML = html
  normalizeClipboardWrapper(contentState, wrapper)

  return wrapper
}
