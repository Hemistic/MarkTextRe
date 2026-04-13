import loadRenderer from '../../renderers'
import { CLASS_OR_ID, PREVIEW_DOMPURIFY_CONFIG } from '../../config'
import { sanitize } from '../../utils'
import {
  createDiagramOptions,
  getInvalidDiagramMessage,
  renderDiagramByType
} from './diagramRenderSupport'

export const renderMermaidTarget = async (stateRender, target, code) => {
  const mermaid = await loadRenderer('mermaid')
  mermaid.initialize({
    securityLevel: 'strict',
    theme: stateRender.muya.options.mermaidTheme
  })

  try {
    await mermaid.parse(code)
    target.innerHTML = sanitize(code, PREVIEW_DOMPURIFY_CONFIG, true)
    await Promise.resolve(mermaid.init(undefined, target))
  } catch (err) {
    target.innerHTML = '< Invalid Mermaid Codes >'
    target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
  }
}

export const renderDiagramTarget = async (stateRender, target, functionType, code) => {
  const render = await loadRenderer(functionType)
  const options = createDiagramOptions(functionType, {
    sequenceTheme: stateRender.muya.options.sequenceTheme,
    vegaTheme: stateRender.muya.options.vegaTheme
  })

  try {
    await renderDiagramByType(render, target, functionType, code, options)
  } catch (err) {
    console.error(`[muya] failed to render ${functionType}`, err)
    const invalidMessage = getInvalidDiagramMessage(functionType)
    target.innerHTML = `< Invalid ${invalidMessage} Codes >`
    target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
  }
}

export const renderMathTarget = async (stateRender, target, cacheKey, code, displayMode) => {
  const katex = await loadRenderer('katex')

  try {
    const html = katex.renderToString(code, { displayMode })
    stateRender.loadMathMap.set(cacheKey, {
      status: 'ready',
      html
    })
    target.classList.remove(CLASS_OR_ID.AG_MATH_ERROR)
    target.innerHTML = html
  } catch (err) {
    stateRender.loadMathMap.set(cacheKey, {
      status: 'error'
    })
    target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
    target.textContent = displayMode
      ? '< Invalid Mathematical Formula >'
      : '< Invalid Inline Mathematical Formula >'
  }
}

export const renderPendingPreview = async (stateRender, key, target) => {
  const preview = stateRender.pendingPreviewRenders.get(key)
  if (!preview || !target || !target.isConnected) {
    return
  }

  stateRender.pendingPreviewRenders.delete(key)

  if (preview.functionType === 'inline-math' || preview.functionType === 'display-math') {
    await renderMathTarget(stateRender, target, preview.cacheKey, preview.code, preview.displayMode)
    return
  }

  if (preview.functionType === 'mermaid') {
    await renderMermaidTarget(stateRender, target, preview.code)
    return
  }

  await renderDiagramTarget(stateRender, target, preview.functionType, preview.code)
}
