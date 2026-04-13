export const getGlobalDocument = () => {
  return typeof document !== 'undefined'
    ? document
    : null
}

export const matchesSelector = (node, selector) => {
  return !!(node && node.nodeType === 1 && typeof node.matches === 'function' && node.matches(selector))
}

export const resolveConnectedNode = node => {
  if (!node || (node.nodeType === 1 && node.isConnected === false)) {
    return getGlobalDocument()
  }

  return node
}

export const queryFromRoot = (root, selector, fallbackRoot = null) => {
  const resolvedRoot = resolveConnectedNode(root)

  if (matchesSelector(resolvedRoot, selector)) {
    return resolvedRoot
  }

  if (resolvedRoot && typeof resolvedRoot.querySelector === 'function') {
    return resolvedRoot.querySelector(selector)
  }

  if (fallbackRoot && typeof fallbackRoot.querySelector === 'function') {
    return fallbackRoot.querySelector(selector)
  }

  return null
}
