import { PARAGRAPH_TYPES, PREVIEW_DOMPURIFY_CONFIG } from '../config'
import { sanitize } from '../utils'
import { getContentStateDocument } from './runtimeDomSupport'

const LIST_REG = /ul|ol/

export const checkPasteType = (contentState, start, fragment) => {
  const fragmentType = fragment.type
  const parent = contentState.getParent(start)

  if (fragmentType === 'p') {
    return 'MERGE'
  } else if (/^h\d/.test(fragmentType)) {
    return start.text ? 'MERGE' : 'NEWLINE'
  } else if (LIST_REG.test(fragmentType)) {
    const listItem = contentState.getParent(parent)
    const list = listItem && listItem.type === 'li' ? contentState.getParent(listItem) : null
    if (list) {
      if (
        list.listType === fragment.listType &&
        listItem.bulletMarkerOrDelimiter === fragment.children[0].bulletMarkerOrDelimiter
      ) {
        return 'MERGE'
      }
      return 'NEWLINE'
    }
    return 'NEWLINE'
  } else {
    return 'NEWLINE'
  }
}

export const checkCopyType = (contentState, html, rawText) => {
  let type = 'normal'
  if (!html && rawText) {
    type = 'copyAsMarkdown'
    const match = /^<([a-zA-Z\d-]+)(?=\s|>).*?>[\s\S]+?<\/([a-zA-Z\d-]+)>$/.exec(rawText.trim())
    if (match && match[1]) {
      const tag = match[1]
      if (tag === 'table' && match.length === 3 && match[2] === 'table') {
        const doc = getContentStateDocument(contentState)
        if (doc) {
          const tmp = doc.createElement('table')
          tmp.innerHTML = sanitize(rawText, PREVIEW_DOMPURIFY_CONFIG, false)
          if (tmp.childElementCount === 1) {
            return 'htmlToMd'
          }
        }
      }

      type = PARAGRAPH_TYPES.find(type => type === tag) ? 'copyAsHtml' : type
    }
  }
  return type
}

export const isListFragment = fragmentType => LIST_REG.test(fragmentType)
