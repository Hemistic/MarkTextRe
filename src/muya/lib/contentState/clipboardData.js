import selection from '../selection'
import { CLASS_OR_ID } from '../config'
import { escapeHTML } from '../utils'
import { htmlToMarkdown } from '../utils/markdownHtml'
import marked from '../parser/marked'

const normalizeTaskListItems = wrapper => {
  const taskListItems = wrapper.querySelectorAll('li.ag-task-list-item')
  for (const item of taskListItems) {
    const firstChild = item.firstElementChild
    if (firstChild && firstChild.nodeName !== 'INPUT') {
      const originItem = document.querySelector(`#${item.id}`)
      let checked = false
      if (originItem && originItem.firstElementChild && originItem.firstElementChild.nodeName === 'INPUT') {
        checked = originItem.firstElementChild.checked
      }

      const input = document.createElement('input')
      input.setAttribute('type', 'checkbox')
      if (checked) {
        input.setAttribute('checked', true)
      }

      item.insertBefore(input, firstChild)
    }
  }
}

const restoreImageSources = (contentState, wrapper) => {
  const images = wrapper.querySelectorAll('span.ag-inline-image img')
  for (const image of images) {
    const src = image.getAttribute('src')
    let originSrc = null
    for (const [sSrc, tSrc] of contentState.stateRender.urlMap.entries()) {
      if (tSrc === src) {
        originSrc = sSrc
        break
      }
    }

    if (originSrc) {
      image.setAttribute('src', originSrc)
    }
  }
}

const normalizeInlineRules = wrapper => {
  const inlineRuleElements = wrapper.querySelectorAll(
    `a.${CLASS_OR_ID.AG_INLINE_RULE},
    code.${CLASS_OR_ID.AG_INLINE_RULE},
    strong.${CLASS_OR_ID.AG_INLINE_RULE},
    em.${CLASS_OR_ID.AG_INLINE_RULE},
    del.${CLASS_OR_ID.AG_INLINE_RULE}`
  )
  for (const element of inlineRuleElements) {
    const span = document.createElement('span')
    span.textContent = element.textContent
    element.replaceWith(span)
  }

  const aLinks = wrapper.querySelectorAll(`.${CLASS_OR_ID.AG_A_LINK}`)
  for (const link of aLinks) {
    const span = document.createElement('span')
    span.innerHTML = link.innerHTML
    link.replaceWith(span)
  }
}

const normalizeCodeBlocks = (contentState, wrapper) => {
  const codefense = wrapper.querySelectorAll('pre[data-role$=\'code\']')
  for (const cf of codefense) {
    const id = cf.id
    const block = contentState.getBlock(id)
    const language = block.lang || ''
    const codeContent = cf.querySelector('.ag-code-content')
    const value = escapeHTML(codeContent.textContent)
    cf.innerHTML = `<code class="language-${language}">${value}</code>`
  }

  const htmlBlock = wrapper.querySelectorAll('figure[data-role=\'HTML\']')
  for (const hb of htmlBlock) {
    const codeContent = hb.querySelector('.ag-code-content')
    const pre = document.createElement('pre')
    pre.textContent = codeContent.textContent
    hb.replaceWith(pre)
  }

  const mathBlock = wrapper.querySelectorAll('figure.ag-container-block')
  for (const mb of mathBlock) {
    const preElement = mb.querySelector('pre[data-role]')
    const functionType = preElement.getAttribute('data-role')
    const codeContent = mb.querySelector('.ag-code-content')
    const value = codeContent.textContent
    let pre
    switch (functionType) {
      case 'multiplemath':
        pre = document.createElement('pre')
        pre.classList.add('multiple-math')
        pre.textContent = value
        mb.replaceWith(pre)
        break
      case 'mermaid':
      case 'flowchart':
      case 'sequence':
      case 'plantuml':
      case 'vega-lite':
        pre = document.createElement('pre')
        pre.innerHTML = `<code class="language-${functionType}">${value}</code>`
        mb.replaceWith(pre)
        break
    }
  }
}

const normalizeClipboardWrapper = (contentState, wrapper) => {
  const removedElements = wrapper.querySelectorAll(
    `.${CLASS_OR_ID.AG_TOOL_BAR},
    .${CLASS_OR_ID.AG_MATH_RENDER},
    .${CLASS_OR_ID.AG_RUBY_RENDER},
    .${CLASS_OR_ID.AG_HTML_PREVIEW},
    .${CLASS_OR_ID.AG_MATH_PREVIEW},
    .${CLASS_OR_ID.AG_COPY_REMOVE},
    .${CLASS_OR_ID.AG_LANGUAGE_INPUT},
    .${CLASS_OR_ID.AG_HTML_TAG} br,
    .${CLASS_OR_ID.AG_FRONT_ICON}`
  )

  for (const element of removedElements) {
    element.remove()
  }

  normalizeTaskListItems(wrapper)
  restoreImageSources(contentState, wrapper)

  const hrs = wrapper.querySelectorAll('[data-role=hr]')
  for (const hr of hrs) {
    hr.replaceWith(document.createElement('hr'))
  }

  const headers = wrapper.querySelectorAll('[data-head]')
  for (const header of headers) {
    const p = document.createElement('p')
    p.textContent = header.textContent
    header.replaceWith(p)
  }

  normalizeInlineRules(wrapper)
  normalizeCodeBlocks(contentState, wrapper)

  const tightListItem = wrapper.querySelectorAll('.ag-tight-list-item')
  for (const li of tightListItem) {
    for (const item of li.childNodes) {
      if (item.tagName === 'P' && item.childElementCount === 1 && item.classList.contains('ag-paragraph')) {
        li.replaceChild(item.firstElementChild, item)
      }
    }
  }

  const lineBreaks = wrapper.querySelectorAll('span.ag-soft-line-break, span.ag-hard-line-break')
  for (const lineBreak of lineBreaks) {
    lineBreak.innerHTML = ''
  }
}

export const getClipboardData = contentState => {
  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return { html: '', text: '' }
  }

  if (start.key === end.key) {
    const startBlock = contentState.getBlock(start.key)
    const { type, text, functionType } = startBlock
    if (type === 'span' && functionType === 'codeContent') {
      const selectedText = text.substring(start.offset, end.offset)
      return {
        html: marked(selectedText, contentState.muya.options),
        text: selectedText
      }
    }
  }

  const html = selection.getSelectionHtml()
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  normalizeClipboardWrapper(contentState, wrapper)

  let htmlData = wrapper.innerHTML
  const textData = htmlToMarkdown(contentState, htmlData)
  htmlData = marked(textData)

  return { html: htmlData, text: textData }
}
