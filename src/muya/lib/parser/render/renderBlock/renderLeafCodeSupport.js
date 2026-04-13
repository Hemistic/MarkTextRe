import { PREVIEW_DOMPURIFY_CONFIG } from '../../../config'
import { sanitize, escapeHTML, getLongUniqueId } from '../../../utils'
import { htmlToVNode } from '../snabbdom'
import { ensurePrismModule, getCachedPrismModule } from '../../../prism/runtimeSupport'

const MARKER_HASK = {
  '<': `%${getLongUniqueId()}%`,
  '>': `%${getLongUniqueId()}%`,
  '"': `%${getLongUniqueId()}%`,
  "'": `%${getLongUniqueId()}%`
}

export const getHighlightHtml = (text, highlights, escape = false, handleLineEnding = false) => {
  let code = ''
  let pos = 0
  const getEscapeHTML = (className, content) => {
    return `${MARKER_HASK['<']}span class=${MARKER_HASK['"']}${className}${MARKER_HASK['"']}${MARKER_HASK['>']}${content}${MARKER_HASK['<']}/span${MARKER_HASK['>']}`
  }

  for (const highlight of highlights) {
    const { start, end, active } = highlight
    code += text.substring(pos, start)
    const className = active ? 'ag-highlight' : 'ag-selection'
    let highlightContent = text.substring(start, end)
    if (handleLineEnding && text.endsWith('\n') && end === text.length) {
      highlightContent = highlightContent.substring(start, end - 1) +
      (escape
        ? getEscapeHTML('ag-line-end', '\n')
        : '<span class="ag-line-end">\n</span>')
    }
    code += escape
      ? getEscapeHTML(className, highlightContent)
      : `<span class="${className}">${highlightContent}</span>`
    pos = end
  }
  if (pos !== text.length) {
    if (handleLineEnding && text.endsWith('\n')) {
      code += text.substring(pos, text.length - 1) +
      (escape
        ? getEscapeHTML('ag-line-end', '\n')
        : '<span class="ag-line-end">\n</span>')
    } else {
      code += text.substring(pos)
    }
  }
  return escapeHTML(code)
}

const pendingHighlightLoads = new Set()

const requestCodeHighlightRender = (stateRender, lang, block) => {
  if (!lang || pendingHighlightLoads.has(lang)) {
    return
  }

  pendingHighlightLoads.add(lang)

  ensurePrismModule()
    .then(({ loadLanguage }) => loadLanguage(lang))
    .then(() => {
      const { contentState } = stateRender.muya
      const anchor = contentState.getAnchor(block)

      if (anchor) {
        contentState.singleRender(anchor)
        return
      }

      contentState.partialRender()
    })
    .catch(err => {
      console.warn(err)
    })
    .finally(() => {
      pendingHighlightLoads.delete(lang)
    })
}

export const renderCodeContentBlock = (stateRender, selector, block, highlights, isEditing = false) => {
  const code = getHighlightHtml(block.text, highlights, true, true)
    .replace(new RegExp(MARKER_HASK['<'], 'g'), '<')
    .replace(new RegExp(MARKER_HASK['>'], 'g'), '>')
    .replace(new RegExp(MARKER_HASK['"'], 'g'), '"')
    .replace(new RegExp(MARKER_HASK["'"], 'g'), "'")

  const prismModule = getCachedPrismModule()
  const transformedLang = prismModule
    ? prismModule.transformAliasToOrigin([block.lang])[0]
    : block.lang
  let nextSelector = selector
  let innerHTML = code

  if (prismModule && transformedLang && /\S/.test(code) && prismModule.loadedLanguages.has(transformedLang) && !isEditing) {
    const wrapper = document.createElement('div')
    wrapper.classList.add(`language-${transformedLang}`)
    wrapper.innerHTML = code
    prismModule.default.highlightElement(wrapper, false, function () {
      nextSelector += `.language-${transformedLang}`
      innerHTML = this.innerHTML
    })
  } else if (transformedLang && /\S/.test(code)) {
    requestCodeHighlightRender(stateRender, transformedLang, block)
  }

  return {
    children: [],
    data: {
      props: {
        innerHTML
      }
    },
    selector: nextSelector
  }
}

export const renderLanguageInputBlock = (text, highlights) => {
  const escapedText = sanitize(text, PREVIEW_DOMPURIFY_CONFIG, true)
  return htmlToVNode(getHighlightHtml(escapedText, highlights, true))
}
