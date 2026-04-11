import TurndownService, { usePluginAddRules } from './turndownService'
import { markdownToState } from './markdownState'

const turnSoftBreakToSpan = html => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(
    `<x-mt id="turn-root">${html}</x-mt>`,
    'text/html'
  )
  const root = doc.querySelector('#turn-root')
  const travel = childNodes => {
    for (const node of childNodes) {
      if (node.nodeType === 3 && node.parentNode.tagName !== 'CODE') {
        let startLen = 0
        let endLen = 0
        const text = node.nodeValue.replace(/^(\n+)/, (_, p) => {
          startLen = p.length
          return ''
        }).replace(/(\n+)$/, (_, p) => {
          endLen = p.length
          return ''
        })
        if (/\n/.test(text)) {
          const tokens = text.split('\n')
          const params = []
          let i = 0
          const len = tokens.length
          for (; i < len; i++) {
            let text = tokens[i]
            if (i === 0 && startLen !== 0) {
              text = '\n'.repeat(startLen) + text
            } else if (i === len - 1 && endLen !== 0) {
              text = text + '\n'.repeat(endLen)
            }
            params.push(document.createTextNode(text))
            if (i !== len - 1) {
              const softBreak = document.createElement('span')
              softBreak.classList.add('ag-soft-line-break')
              params.push(softBreak)
            }
          }
          node.replaceWith(...params)
        }
      } else if (node.nodeType === 1) {
        travel(node.childNodes)
      }
    }
  }
  travel(root.childNodes)
  return root.innerHTML.trim()
}

export const htmlToMarkdown = (contentState, html, keeps = []) => {
  const { turndownConfig } = contentState
  const turndownService = new TurndownService(turndownConfig)
  usePluginAddRules(turndownService, keeps)

  html = html.replace(/<span>&nbsp;<\/span>/g, String.fromCharCode(160))
  html = turnSoftBreakToSpan(html)
  return turndownService.turndown(html)
}

export const htmlToState = (contentState, html) => {
  const markdown = htmlToMarkdown(contentState, html, ['ruby', 'rt', 'u', 'br'])
  return markdownToState(contentState, markdown)
}
