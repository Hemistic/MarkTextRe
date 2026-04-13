import { CLASS_OR_ID } from '../config'
import { getContentStateUrlMap } from './runtimeRenderAccessSupport'
import { getNodeDocument, queryContentState } from './runtimeDomSupport'

export const normalizeTaskListItems = (contentState, wrapper) => {
  const doc = getNodeDocument(wrapper)
  if (!doc) {
    return
  }
  const taskListItems = wrapper.querySelectorAll('li.ag-task-list-item')
  for (const item of taskListItems) {
    const firstChild = item.firstElementChild
    if (firstChild && firstChild.nodeName !== 'INPUT') {
      const originItem = queryContentState(contentState, `#${item.id}`)
      let checked = false
      if (originItem && originItem.firstElementChild && originItem.firstElementChild.nodeName === 'INPUT') {
        checked = originItem.firstElementChild.checked
      }

      const input = doc.createElement('input')
      input.setAttribute('type', 'checkbox')
      if (checked) {
        input.setAttribute('checked', true)
      }

      item.insertBefore(input, firstChild)
    }
  }
}

export const restoreImageSources = (contentState, wrapper) => {
  const urlMap = getContentStateUrlMap(contentState)
  if (!urlMap) {
    return
  }

  const images = wrapper.querySelectorAll('span.ag-inline-image img')
  for (const image of images) {
    const src = image.getAttribute('src')
    let originSrc = null
    for (const [sourceSrc, targetSrc] of urlMap.entries()) {
      if (targetSrc === src) {
        originSrc = sourceSrc
        break
      }
    }

    if (originSrc) {
      image.setAttribute('src', originSrc)
    }
  }
}

export const normalizeInlineRules = wrapper => {
  const doc = getNodeDocument(wrapper)
  if (!doc) {
    return
  }
  const inlineRuleElements = wrapper.querySelectorAll(
    `a.${CLASS_OR_ID.AG_INLINE_RULE},
    code.${CLASS_OR_ID.AG_INLINE_RULE},
    strong.${CLASS_OR_ID.AG_INLINE_RULE},
    em.${CLASS_OR_ID.AG_INLINE_RULE},
    del.${CLASS_OR_ID.AG_INLINE_RULE}`
  )
  for (const element of inlineRuleElements) {
    const span = doc.createElement('span')
    span.textContent = element.textContent
    element.replaceWith(span)
  }

  const aLinks = wrapper.querySelectorAll(`.${CLASS_OR_ID.AG_A_LINK}`)
  for (const link of aLinks) {
    const span = doc.createElement('span')
    span.innerHTML = link.innerHTML
    link.replaceWith(span)
  }
}
