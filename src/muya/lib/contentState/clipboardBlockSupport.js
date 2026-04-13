import { escapeHTML } from '../utils'
import { getNodeDocument } from './runtimeDomSupport'

export const normalizeCodeBlocks = (contentState, wrapper) => {
  const doc = getNodeDocument(wrapper)
  if (!doc) {
    return
  }
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
    const pre = doc.createElement('pre')
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
        pre = doc.createElement('pre')
        pre.classList.add('multiple-math')
        pre.textContent = value
        mb.replaceWith(pre)
        break
      case 'mermaid':
      case 'flowchart':
      case 'sequence':
      case 'plantuml':
      case 'vega-lite':
        pre = doc.createElement('pre')
        pre.innerHTML = `<code class="language-${functionType}">${value}</code>`
        mb.replaceWith(pre)
        break
    }
  }
}
