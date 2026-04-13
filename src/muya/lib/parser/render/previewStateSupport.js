export const getPreviewSelectorKey = blockKey => `#${blockKey}`

export const getMathCacheKey = (code, displayMode) => {
  return `${code}_${displayMode ? 'display' : 'inline'}_math`
}

export const isMathPreview = functionType => {
  return functionType === 'inline-math' || functionType === 'display-math'
}

export const queueMathPreview = (stateRender, selectorKey, cacheKey, code, displayMode) => {
  stateRender.pendingPreviewRenders.set(selectorKey, {
    functionType: displayMode ? 'display-math' : 'inline-math',
    cacheKey,
    code,
    displayMode
  })
}

export const cacheDiagramPreview = (stateRender, selectorKey, functionType, code) => {
  const cache = functionType === 'mermaid'
    ? stateRender.mermaidCache
    : stateRender.diagramCache

  cache.set(selectorKey, {
    code,
    functionType
  })
}

export const flushCachedPreviewsToPending = stateRender => {
  for (const [key, value] of stateRender.mermaidCache.entries()) {
    stateRender.pendingPreviewRenders.set(key, value)
  }

  for (const [key, value] of stateRender.diagramCache.entries()) {
    stateRender.pendingPreviewRenders.set(key, value)
  }

  stateRender.mermaidCache.clear()
  stateRender.diagramCache.clear()
}
