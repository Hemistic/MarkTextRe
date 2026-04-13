import selection from '../selection'
import { CLASS_OR_ID } from '../config'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleFormatClick = (contentState, event) => {
  const node = selection.getSelectionStart()
  const inlineNode = node ? node.closest('.ag-inline-rule') : null

  let parentNode = inlineNode
  while (parentNode !== null && parentNode.classList.contains(CLASS_OR_ID.AG_INLINE_RULE)) {
    if (parentNode.tagName === 'A') {
      const formatType = 'link'
      const data = {
        text: inlineNode.textContent,
        href: parentNode.getAttribute('href') || ''
      }
      dispatchContentStateEvent(contentState, 'format-click', {
        event,
        formatType,
        data
      })
      break
    }
    parentNode = parentNode.parentNode
  }

  if (!inlineNode) {
    return
  }

  let formatType = null
  let data = null
  switch (inlineNode.tagName) {
    case 'SPAN':
      if (inlineNode.hasAttribute('data-emoji')) {
        formatType = 'emoji'
        data = inlineNode.getAttribute('data-emoji')
      } else if (inlineNode.classList.contains('ag-math-text')) {
        formatType = 'inline_math'
        data = inlineNode.textContent
      }
      break
    case 'STRONG':
      formatType = 'strong'
      data = inlineNode.textContent
      break
    case 'EM':
      formatType = 'em'
      data = inlineNode.textContent
      break
    case 'DEL':
      formatType = 'del'
      data = inlineNode.textContent
      break
    case 'CODE':
      formatType = 'inline_code'
      data = inlineNode.textContent
      break
  }
  if (formatType) {
    dispatchContentStateEvent(contentState, 'format-click', {
      event,
      formatType,
      data
    })
  }
}
