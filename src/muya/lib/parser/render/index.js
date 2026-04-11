import loadRenderer from '../../renderers'
import { CLASS_OR_ID, PREVIEW_DOMPURIFY_CONFIG } from '../../config'
import { conflict, mixins, camelToSnake, sanitize } from '../../utils'
import { patch, toVNode, toHTML, h } from './snabbdom'
import { beginRules } from '../rules'
import renderInlines from './renderInlines'
import renderBlock from './renderBlock'

class StateRender {
  constructor (muya) {
    this.muya = muya
    this.eventCenter = muya.eventCenter
    this.codeCache = new Map()
    this.loadImageMap = new Map()
    this.loadMathMap = new Map()
    this.mermaidCache = new Map()
    this.diagramCache = new Map()
    this.tokenCache = new Map()
    this.labels = new Map()
    this.urlMap = new Map()
    this.renderingTable = null
    this.renderingRowContainer = null
    this.container = null
    this.pendingPreviewRenders = new Map()
    this.scheduledPreviewRenders = new Set()
    this.previewObserver = null
  }

  setContainer (container) {
    this.container = container
    this.resetPreviewObserver()
  }

  resetPreviewObserver () {
    if (this.previewObserver) {
      this.previewObserver.disconnect()
      this.previewObserver = null
    }

    if (
      !this.container ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    this.previewObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }

        this.previewObserver.unobserve(entry.target)
        this.schedulePreviewRender(`#${entry.target.id}`, entry.target)
      }
    }, {
      root: this.container,
      rootMargin: '240px 0px'
    })
  }

  schedulePreviewRender (key, target) {
    if (this.scheduledPreviewRenders.has(key)) {
      return
    }

    this.scheduledPreviewRenders.add(key)

    const run = () => {
      this.scheduledPreviewRenders.delete(key)
      void this.renderPendingPreview(key, target)
    }

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 300 })
    } else {
      setTimeout(run, 0)
    }
  }

  // collect link reference definition
  collectLabels (blocks) {
    this.labels.clear()

    const travel = block => {
      const { text, children } = block
      if (children && children.length) {
        children.forEach(c => travel(c))
      } else if (text) {
        const tokens = beginRules.reference_definition.exec(text)
        if (tokens) {
          const key = (tokens[2] + tokens[3]).toLowerCase()
          if (!this.labels.has(key)) {
            this.labels.set(key, {
              href: tokens[6],
              title: tokens[10] || ''
            })
          }
        }
      }
    }

    blocks.forEach(b => travel(b))
  }

  checkConflicted (block, token, cursor) {
    const { start, end } = cursor
    const key = block.key
    const { start: tokenStart, end: tokenEnd } = token.range

    if (key !== start.key && key !== end.key) {
      return false
    } else if (key === start.key && key !== end.key) {
      return conflict([tokenStart, tokenEnd], [start.offset, start.offset])
    } else if (key !== start.key && key === end.key) {
      return conflict([tokenStart, tokenEnd], [end.offset, end.offset])
    } else {
      return conflict([tokenStart, tokenEnd], [start.offset, start.offset]) ||
        conflict([tokenStart, tokenEnd], [end.offset, end.offset])
    }
  }

  getClassName (outerClass, block, token, cursor) {
    return outerClass || (this.checkConflicted(block, token, cursor) ? CLASS_OR_ID.AG_GRAY : CLASS_OR_ID.AG_HIDE)
  }

  getHighlightClassName (active) {
    return active ? CLASS_OR_ID.AG_HIGHLIGHT : CLASS_OR_ID.AG_SELECTION
  }

  getSelector (block, activeBlocks) {
    const { cursor, selectedBlock } = this.muya.contentState
    const type = block.type === 'hr' ? 'p' : block.type
    const isActive = activeBlocks.some(b => b.key === block.key) || block.key === cursor.start.key

    let selector = `${type}#${block.key}.${CLASS_OR_ID.AG_PARAGRAPH}`
    if (isActive) {
      selector += `.${CLASS_OR_ID.AG_ACTIVE}`
    }
    if (type === 'span') {
      selector += `.ag-${camelToSnake(block.functionType)}`
    }
    if (!block.parent && selectedBlock && block.key === selectedBlock.key) {
      selector += `.${CLASS_OR_ID.AG_SELECTED}`
    }
    return selector
  }

  async renderMermaidTarget (target, code) {
    const mermaid = await loadRenderer('mermaid')
    mermaid.initialize({
      securityLevel: 'strict',
      theme: this.muya.options.mermaidTheme
    })

    try {
      mermaid.parse(code)
      target.innerHTML = sanitize(code, PREVIEW_DOMPURIFY_CONFIG, true)
      mermaid.init(undefined, target)
    } catch (err) {
      target.innerHTML = '< Invalid Mermaid Codes >'
      target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
    }
  }

  async renderDiagramTarget (target, functionType, code) {
    const render = await loadRenderer(functionType)
    const options = {}

    if (functionType === 'sequence') {
      Object.assign(options, { theme: this.muya.options.sequenceTheme })
    } else if (functionType === 'vega-lite') {
      Object.assign(options, {
        actions: false,
        tooltip: false,
        renderer: 'svg',
        theme: this.muya.options.vegaTheme
      })
    }

    try {
      if (functionType === 'flowchart' || functionType === 'sequence') {
        const diagram = render.parse(code)
        target.innerHTML = ''
        diagram.drawSVG(target, options)
      } else if (functionType === 'plantuml') {
        const diagram = render.parse(code)
        target.innerHTML = ''
        diagram.insertImgElement(target)
      } else if (functionType === 'vega-lite') {
        target.innerHTML = ''
        await render(target, JSON.parse(code), options)
      }
    } catch (err) {
      const invalidMessage = functionType === 'flowchart'
        ? 'Flow Chart'
        : functionType === 'vega-lite'
          ? 'Vega-Lite'
          : functionType === 'plantuml'
            ? 'PlantUML'
            : 'Sequence'
      target.innerHTML = `< Invalid ${invalidMessage} Codes >`
      target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
    }
  }

  async renderMathTarget (target, cacheKey, code, displayMode) {
    const katex = await loadRenderer('katex')

    try {
      const html = katex.renderToString(code, { displayMode })
      this.loadMathMap.set(cacheKey, {
        status: 'ready',
        html
      })
      target.classList.remove(CLASS_OR_ID.AG_MATH_ERROR)
      target.innerHTML = html
    } catch (err) {
      this.loadMathMap.set(cacheKey, {
        status: 'error'
      })
      target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
      target.textContent = displayMode
        ? '< Invalid Mathematical Formula >'
        : '< Invalid Inline Mathematical Formula >'
    }
  }

  flushPendingPreviewRenders () {
    for (const [key, value] of this.mermaidCache.entries()) {
      this.pendingPreviewRenders.set(key, value)
    }

    for (const [key, value] of this.diagramCache.entries()) {
      this.pendingPreviewRenders.set(key, value)
    }

    this.mermaidCache.clear()
    this.diagramCache.clear()

    for (const [key, preview] of this.pendingPreviewRenders.entries()) {
      const target = document.querySelector(key)
      if (!target) {
        continue
      }

      target.classList.remove(CLASS_OR_ID.AG_MATH_ERROR)

      if (preview.functionType === 'inline-math' || preview.functionType === 'display-math') {
        this.schedulePreviewRender(key, target)
      } else if (this.previewObserver) {
        this.previewObserver.observe(target)
      } else {
        this.schedulePreviewRender(key, target)
      }
    }
  }

  async renderPendingPreview (key, target) {
    const preview = this.pendingPreviewRenders.get(key)
    if (!preview || !target || !target.isConnected) {
      return
    }

    this.pendingPreviewRenders.delete(key)

    if (preview.functionType === 'inline-math' || preview.functionType === 'display-math') {
      await this.renderMathTarget(target, preview.cacheKey, preview.code, preview.displayMode)
      return
    }

    if (preview.functionType === 'mermaid') {
      await this.renderMermaidTarget(target, preview.code)
      return
    }

    await this.renderDiagramTarget(target, preview.functionType, preview.code)
  }

  render (blocks, activeBlocks, matches) {
    const selector = `div#${CLASS_OR_ID.AG_EDITOR_ID}`
    const children = blocks.map(block => {
      return this.renderBlock(null, block, activeBlocks, matches, true)
    })
    const newVdom = h(selector, children)
    const rootDom = document.querySelector(selector) || this.container
    const oldVdom = toVNode(rootDom)

    patch(oldVdom, newVdom)
    this.flushPendingPreviewRenders()
    this.codeCache.clear()
  }

  // Only render the blocks which you updated
  partialRender (blocks, activeBlocks, matches, startKey, endKey) {
    const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1]
    // If cursor is not in render blocks, need to render cursor block independently
    const needRenderCursorBlock = blocks.indexOf(cursorOutMostBlock) === -1
    const newVnode = h('section', blocks.map(block => this.renderBlock(null, block, activeBlocks, matches)))
    const html = toHTML(newVnode).replace(/^<section>([\s\S]+?)<\/section>$/, '$1')

    const needToRemoved = []
    const firstOldDom = startKey
      ? document.querySelector(`#${startKey}`)
      : document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`).firstElementChild
    if (!firstOldDom) {
      // TODO@Jocs Just for fix #541, Because I'll rewrite block and render method, it will nolonger have this issue.
      return
    }
    needToRemoved.push(firstOldDom)
    let nextSibling = firstOldDom.nextElementSibling
    while (nextSibling && nextSibling.id !== endKey) {
      needToRemoved.push(nextSibling)
      nextSibling = nextSibling.nextElementSibling
    }
    nextSibling && needToRemoved.push(nextSibling)

    firstOldDom.insertAdjacentHTML('beforebegin', html)

    Array.from(needToRemoved).forEach(dom => dom.remove())

    // Render cursor block independently
    if (needRenderCursorBlock) {
      const { key } = cursorOutMostBlock
      const cursorDom = document.querySelector(`#${key}`)
      if (cursorDom) {
        const oldCursorVnode = toVNode(cursorDom)
        const newCursorVnode = this.renderBlock(null, cursorOutMostBlock, activeBlocks, matches)
        patch(oldCursorVnode, newCursorVnode)
      }
    }

    this.flushPendingPreviewRenders()
    this.codeCache.clear()
  }

  /**
   * Only render one block.
   *
   * @param {object} block
   * @param {array} activeBlocks
   * @param {array} matches
   */
  singleRender (block, activeBlocks, matches) {
    const selector = `#${block.key}`
    const newVdom = this.renderBlock(null, block, activeBlocks, matches, true)
    const rootDom = document.querySelector(selector)
    const oldVdom = toVNode(rootDom)
    patch(oldVdom, newVdom)
    this.flushPendingPreviewRenders()
    this.codeCache.clear()
  }

  invalidateImageCache () {
    this.loadImageMap.forEach((imageInfo, key) => {
      imageInfo.touchMsec = Date.now()
      this.loadImageMap.set(key, imageInfo)
    })
  }
}

mixins(StateRender, renderInlines, renderBlock)

export default StateRender
