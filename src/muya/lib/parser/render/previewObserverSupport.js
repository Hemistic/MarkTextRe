import { CLASS_OR_ID } from '../../config'
import { queryStateRenderEditor } from '../../contentState/runtimeDomSupport'

export const resetPreviewObserver = stateRender => {
  if (stateRender.previewObserver) {
    stateRender.previewObserver.disconnect()
    stateRender.previewObserver = null
  }

  if (
    !stateRender.container ||
    typeof IntersectionObserver === 'undefined'
  ) {
    return
  }

  stateRender.previewObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }

      stateRender.previewObserver.unobserve(entry.target)
      stateRender.schedulePreviewRender(`#${entry.target.id}`, entry.target)
    }
  }, {
    root: stateRender.container,
    rootMargin: '240px 0px'
  })
}

export const schedulePreviewRender = (stateRender, key, target) => {
  if (stateRender.scheduledPreviewRenders.has(key)) {
    return
  }

  stateRender.scheduledPreviewRenders.add(key)

  const run = () => {
    stateRender.scheduledPreviewRenders.delete(key)
    void stateRender.renderPendingPreview(key, target)
  }

  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 300 })
  } else {
    setTimeout(run, 0)
  }
}

export const flushPendingPreviewRenders = stateRender => {
  for (const [key, value] of stateRender.mermaidCache.entries()) {
    stateRender.pendingPreviewRenders.set(key, value)
  }

  for (const [key, value] of stateRender.diagramCache.entries()) {
    stateRender.pendingPreviewRenders.set(key, value)
  }

  stateRender.mermaidCache.clear()
  stateRender.diagramCache.clear()

  for (const [key, preview] of stateRender.pendingPreviewRenders.entries()) {
    const target = queryStateRenderEditor(stateRender, key)
    if (!target) {
      continue
    }

    target.classList.remove(CLASS_OR_ID.AG_MATH_ERROR)

    if (preview.functionType === 'inline-math' || preview.functionType === 'display-math') {
      stateRender.schedulePreviewRender(key, target)
    } else if (stateRender.previewObserver) {
      stateRender.previewObserver.observe(target)
    } else {
      stateRender.schedulePreviewRender(key, target)
    }
  }
}
