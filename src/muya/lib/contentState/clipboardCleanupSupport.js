import { CLASS_OR_ID } from '../config'
import {
  normalizeTaskListItems,
  restoreImageSources,
  normalizeInlineRules
} from './clipboardInlineSupport'
import { normalizeCodeBlocks } from './clipboardBlockSupport'
import { getNodeDocument } from './runtimeDomSupport'

const normalizeStructureNodes = wrapper => {
  const doc = getNodeDocument(wrapper)
  if (!doc) {
    return
  }
  const hrs = wrapper.querySelectorAll('[data-role=hr]')
  for (const hr of hrs) {
    hr.replaceWith(doc.createElement('hr'))
  }

  const headers = wrapper.querySelectorAll('[data-head]')
  for (const header of headers) {
    const p = doc.createElement('p')
    p.textContent = header.textContent
    header.replaceWith(p)
  }

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

export const normalizeClipboardWrapper = (contentState, wrapper) => {
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

  normalizeTaskListItems(contentState, wrapper)
  restoreImageSources(contentState, wrapper)
  normalizeInlineRules(wrapper)
  normalizeCodeBlocks(contentState, wrapper)
  normalizeStructureNodes(wrapper)
}
