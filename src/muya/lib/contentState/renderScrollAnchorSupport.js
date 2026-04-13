import {
  getContentStateContainer,
  getContentStateEditor
} from './runtimeDomSupport'

const isElementNode = node => !!node && node.nodeType === 1

const getEditorChildren = editor => {
  if (!editor || !editor.children) {
    return []
  }

  return Array.from(editor.children).filter(child => isElementNode(child) && child.id)
}

const clampScrollTop = (container, value) => {
  if (!container || !Number.isFinite(value)) {
    return null
  }

  if (typeof container.scrollHeight === 'number' && typeof container.clientHeight === 'number') {
    return Math.max(0, Math.min(value, container.scrollHeight - container.clientHeight))
  }

  return Math.max(0, value)
}

export const captureRenderScrollAnchor = contentState => {
  const container = getContentStateContainer(contentState)
  const editor = getContentStateEditor(contentState)
  if (
    !container ||
    !editor ||
    typeof container.getBoundingClientRect !== 'function'
  ) {
    return null
  }

  const children = getEditorChildren(editor)
  if (!children.length) {
    return null
  }

  const containerRect = container.getBoundingClientRect()
  const threshold = containerRect.top + 4
  let anchor = null

  for (const child of children) {
    const rect = child.getBoundingClientRect()
    if (rect.bottom > threshold) {
      anchor = child
      break
    }
  }

  if (!anchor) {
    anchor = children[children.length - 1]
  }

  const anchorRect = anchor.getBoundingClientRect()

  return {
    key: anchor.id,
    offsetTop: anchorRect.top - containerRect.top
  }
}

export const restoreRenderScrollAnchor = (contentState, snapshot) => {
  if (!snapshot) {
    return false
  }

  const container = getContentStateContainer(contentState)
  const editor = getContentStateEditor(contentState)
  if (
    !container ||
    !editor ||
    typeof container.getBoundingClientRect !== 'function'
  ) {
    return false
  }

  const children = getEditorChildren(editor)
  const anchor = children.find(child => child.id === snapshot.key)
  if (!anchor) {
    return false
  }

  const containerRect = container.getBoundingClientRect()
  const anchorRect = anchor.getBoundingClientRect()
  const delta = (anchorRect.top - containerRect.top) - snapshot.offsetTop
  if (Math.abs(delta) <= 1) {
    return false
  }

  const nextScrollTop = clampScrollTop(container, container.scrollTop + delta)
  if (nextScrollTop === null || Math.abs(container.scrollTop - nextScrollTop) <= 1) {
    return false
  }

  container.scrollTop = nextScrollTop
  return true
}
