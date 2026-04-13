import { CLASS_OR_ID, PREVIEW_DOMPURIFY_CONFIG } from '../../../config'
import { sanitize, getImageInfo } from '../../../utils'
import { htmlToVNode } from '../snabbdom'

const renderHtmlPreview = (stateRender, code) => {
  const { disableHtml } = stateRender.muya.options
  const htmlContent = sanitize(code, PREVIEW_DOMPURIFY_CONFIG, disableHtml)

  if (/^<([a-z][a-z\d]*)[^>]*?>(\s*)<\/\1>$/.test(htmlContent.trim())) {
    return htmlToVNode('<div class="ag-empty">&lt;Empty HTML Block&gt;</div>')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const imgs = doc.documentElement.querySelectorAll('img')
  for (const img of imgs) {
    const src = img.getAttribute('src')
    const imageInfo = getImageInfo(src)
    img.setAttribute('src', imageInfo.src)
  }

  return htmlToVNode(doc.documentElement.querySelector('body').innerHTML)
}

export const renderDivBlock = (stateRender, selector, data, block) => {
  const { loadMathMap } = stateRender
  const code = stateRender.codeCache.get(block.preSibling)
  let nextSelector = selector
  let children = ''

  switch (block.functionType) {
    case 'html': {
      nextSelector += `.${CLASS_OR_ID.AG_HTML_PREVIEW}`
      Object.assign(data.attrs, { spellcheck: 'false' })
      children = renderHtmlPreview(stateRender, code)
      break
    }
    case 'multiplemath': {
      const cacheKey = `${code}_display_math`
      const selectorKey = `#${block.key}`
      const mathState = loadMathMap.get(cacheKey)
      nextSelector += `.${CLASS_OR_ID.AG_CONTAINER_PREVIEW}`
      Object.assign(data.attrs, { spellcheck: 'false' })
      if (code === '') {
        children = '< Empty Mathematical Formula >'
        nextSelector += `.${CLASS_OR_ID.AG_EMPTY}`
      } else if (mathState && mathState.status === 'ready') {
        children = htmlToVNode(mathState.html)
      } else if (mathState && mathState.status === 'error') {
        children = '< Invalid Mathematical Formula >'
        nextSelector += `.${CLASS_OR_ID.AG_MATH_ERROR}`
      } else {
        children = code
        stateRender.pendingPreviewRenders.set(selectorKey, {
          functionType: 'display-math',
          cacheKey,
          code,
          displayMode: true
        })
      }
      break
    }
    case 'mermaid':
    case 'flowchart':
    case 'sequence':
    case 'plantuml':
    case 'vega-lite': {
      nextSelector += `.${CLASS_OR_ID.AG_CONTAINER_PREVIEW}`
      Object.assign(data.attrs, { spellcheck: 'false' })
      if (code === '') {
        children = block.functionType === 'mermaid'
          ? '< Empty Mermaid Block >'
          : '< Empty Diagram Block >'
        nextSelector += `.${CLASS_OR_ID.AG_EMPTY}`
      } else {
        children = 'Loading...'
        const cache = block.functionType === 'mermaid'
          ? stateRender.mermaidCache
          : stateRender.diagramCache
        cache.set(`#${block.key}`, {
          code,
          functionType: block.functionType
        })
      }
      break
    }
  }

  return { children, selector: nextSelector }
}

export const renderInputBlock = (stateRender, selector, data, block) => {
  const { fontSize, lineHeight } = stateRender.muya.options
  let nextSelector = `${block.type}#${block.key}.${CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX}`

  Object.assign(data.attrs, {
    type: 'checkbox',
    style: `top: ${(fontSize * lineHeight / 2 - 8).toFixed(2)}px`
  })

  if (block.checked) {
    Object.assign(data.attrs, {
      checked: true
    })
    nextSelector += `.${CLASS_OR_ID.AG_CHECKBOX_CHECKED}`
  }

  return { children: '', selector: nextSelector }
}
