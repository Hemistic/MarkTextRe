const getInternalContentStateStateRender = (contentState, allowDestroyed = false) => {
  const { stateRender, runtime } = contentState

  if (
    !allowDestroyed && runtime && runtime.destroyed ||
    !stateRender
  ) {
    return null
  }

  return stateRender
}

export const getContentStateStateRender = contentState => {
  return getInternalContentStateStateRender(contentState)
}

export const getContentStateLabels = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  return stateRender && stateRender.labels instanceof Map
    ? stateRender.labels
    : new Map()
}

export const getContentStateUrlMap = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  return stateRender && stateRender.urlMap instanceof Map
    ? stateRender.urlMap
    : null
}

export const invalidateContentStateImageCache = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  if (stateRender && typeof stateRender.invalidateImageCache === 'function') {
    stateRender.invalidateImageCache()
  }
}

export const clearContentStateTokenCache = contentState => {
  const stateRender = getContentStateStateRender(contentState)
  if (stateRender && stateRender.tokenCache instanceof Map) {
    stateRender.tokenCache.clear()
  }
}

export const setContentStateRenderContainer = (contentState, container) => {
  const stateRender = getInternalContentStateStateRender(contentState, true)
  if (stateRender && typeof stateRender.setContainer === 'function') {
    stateRender.setContainer(container)
  }
}

export const releaseContentStateRender = contentState => {
  setContentStateRenderContainer(contentState, null)
}

export const getStateRenderContainer = stateRender => {
  if (!stateRender) {
    return null
  }

  const { container } = stateRender
  return container && container.isConnected === false ? null : container
}
