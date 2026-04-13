import marked from '../parser/marked'
import Prism from 'prismjs'
import katex from 'katex'
import 'katex/dist/contrib/mhchem.min.js'
import loadRenderer from '../renderers'
import { EXPORT_DOMPURIFY_CONFIG } from '../config'
import { sanitize, unescapeHTML } from '../utils'
import { validEmoji } from '../ui/emojis'
import { createDiagramOptions, renderDiagramByType } from '../parser/render/diagramRenderSupport'

const DIAGRAM_TYPE = [
  'mermaid',
  'flowchart',
  'sequence',
  'plantuml',
  'vega-lite'
]

const getExportDocument = exportHtml => {
  const container = exportHtml && exportHtml.muya ? exportHtml.muya.container : null
  if (container && container.ownerDocument) {
    return container.ownerDocument
  }

  return typeof document !== 'undefined'
    ? document
    : null
}

export const createMathRenderer = exportHtml => (math, displayMode) => {
  exportHtml.mathRendererCalled = true

  try {
    return katex.renderToString(math, {
      displayMode
    })
  } catch (err) {
    return displayMode
      ? `<pre class="multiple-math invalid">\n${math}</pre>\n`
      : `<span class="inline-math invalid" title="invalid math">${math}</span>`
  }
}

export const renderMermaid = async exportHtml => {
  const doc = getExportDocument(exportHtml)
  if (!doc) {
    return
  }
  const codes = exportHtml.exportContainer.querySelectorAll('code.language-mermaid')
  for (const code of codes) {
    const preEle = code.parentNode
    const mermaidContainer = doc.createElement('div')
    mermaidContainer.innerHTML = sanitize(unescapeHTML(code.innerHTML), EXPORT_DOMPURIFY_CONFIG, true)
    mermaidContainer.classList.add('mermaid')
    preEle.replaceWith(mermaidContainer)
  }
  const mermaid = await loadRenderer('mermaid')
  mermaid.initialize({
    securityLevel: 'strict',
    theme: 'default'
  })
  const containers = exportHtml.exportContainer.querySelectorAll('div.mermaid')
  for (const container of containers) {
    await mermaid.parse(container.textContent || '')
  }
  await Promise.resolve(mermaid.init(undefined, containers))
  if (exportHtml.muya) {
    mermaid.initialize({
      securityLevel: 'strict',
      theme: exportHtml.muya.options.mermaidTheme
    })
  }
}

export const renderDiagram = async exportHtml => {
  const doc = getExportDocument(exportHtml)
  if (!doc) {
    return
  }
  const selector = 'code.language-vega-lite, code.language-flowchart, code.language-sequence, code.language-plantuml'
  const renderers = {
    flowchart: await loadRenderer('flowchart'),
    sequence: await loadRenderer('sequence'),
    plantuml: await loadRenderer('plantuml'),
    'vega-lite': await loadRenderer('vega-lite')
  }
  const codes = exportHtml.exportContainer.querySelectorAll(selector)
  for (const code of codes) {
    const rawCode = unescapeHTML(code.innerHTML)
    const functionType = (() => {
      if (/sequence/.test(code.className)) {
        return 'sequence'
      } else if (/plantuml/.test(code.className)) {
        return 'plantuml'
      } else if (/flowchart/.test(code.className)) {
        return 'flowchart'
      } else {
        return 'vega-lite'
      }
    })()
    const render = renderers[functionType]
    const preParent = code.parentNode
    const diagramContainer = doc.createElement('div')
    diagramContainer.classList.add(functionType)
    preParent.replaceWith(diagramContainer)
    const options = {}
    Object.assign(options, createDiagramOptions(functionType, {
      sequenceTheme: exportHtml.muya && exportHtml.muya.options
        ? exportHtml.muya.options.sequenceTheme
        : 'simple',
      vegaTheme: 'latimes'
    }))
    try {
      await renderDiagramByType(render, diagramContainer, functionType, rawCode, options)
    } catch (err) {
      console.error(`[muya] failed to render ${functionType}`, err)
      diagramContainer.innerHTML = '< Invalid Diagram >'
    }
  }
}

export const renderExportHtml = async (exportHtml, toc) => {
  exportHtml.mathRendererCalled = false
  let html = marked(exportHtml.markdown, {
    superSubScript: exportHtml.muya ? exportHtml.muya.options.superSubScript : false,
    footnote: exportHtml.muya ? exportHtml.muya.options.footnote : false,
    isGitlabCompatibilityEnabled: exportHtml.muya ? exportHtml.muya.options.isGitlabCompatibilityEnabled : false,
    highlight (code, lang) {
      if (!lang) {
        return code
      }

      if (DIAGRAM_TYPE.includes(lang)) {
        return code
      }

      const grammar = Prism.languages[lang]
      if (!grammar) {
        console.warn(`Unable to find grammar for "${lang}".`)
        return code
      }
      return Prism.highlight(code, grammar, lang)
    },
    emojiRenderer (emoji) {
      const validate = validEmoji(emoji)
      if (validate) {
        return validate.emoji
      } else {
        return `:${emoji}:`
      }
    },
    mathRenderer: exportHtml.mathRenderer,
    tocRenderer () {
      if (!toc) {
        return ''
      }
      return toc
    }
  })

  html = sanitize(html, EXPORT_DOMPURIFY_CONFIG, false)

  const doc = getExportDocument(exportHtml)
  if (!doc || !doc.body) {
    return html
  }

  const exportContainer = exportHtml.exportContainer = doc.createElement('div')
  exportContainer.classList.add('ag-render-container')
  exportContainer.innerHTML = html
  doc.body.appendChild(exportContainer)

  await renderMermaid(exportHtml)
  await renderDiagram(exportHtml)
  let result = exportContainer.innerHTML
  exportContainer.remove()

  const pathes = doc.querySelectorAll('path[id^=raphael-marker-]')
  const def = '<defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">'
  result = result.replace(def, () => {
    let str = ''
    for (const path of pathes) {
      str += path.outerHTML
    }
    return `${def}${str}`
  })

  exportHtml.exportContainer = null
  return result
}
