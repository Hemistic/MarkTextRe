import { PREVIEW_DOMPURIFY_CONFIG, URL_REG } from '../config'
import { sanitize, getPageTitle } from '../utils'
import { getContentStateDocument, getNodeDocument } from './runtimeDomSupport'

const extractBodyHtml = rawHtml => {
  if (!/<body>[\s\S]*<\/body>/.test(rawHtml)) {
    return rawHtml
  }

  const match = /<body>([\s\S]*)<\/body>/.exec(rawHtml)
  return match && typeof match[1] === 'string' ? match[1] : rawHtml
}

const normalizeTableNodes = tempWrapper => {
  const doc = getNodeDocument(tempWrapper)
  if (!doc) {
    return
  }
  const tables = Array.from(tempWrapper.querySelectorAll('table'))
  for (const table of tables) {
    const row = table.querySelector('tr')
    if (row && row.firstElementChild && row.firstElementChild.tagName !== 'TH') {
      ;[...row.children].forEach(cell => {
        const th = doc.createElement('th')
        th.innerHTML = cell.innerHTML
        cell.replaceWith(th)
      })
    }

    const paragraphs = Array.from(table.querySelectorAll('p'))
    for (const p of paragraphs) {
      const span = doc.createElement('span')
      span.innerHTML = p.innerHTML
      p.replaceWith(span)
    }

    const tds = table.querySelectorAll('td')
    for (const td of tds) {
      const tableDataHtml = td.innerHTML
      if (/<br>/.test(tableDataHtml)) {
        td.innerHTML = tableDataHtml.replace(/<br>/g, '&lt;br&gt;')
      }
    }
  }
}

const normalizeAnchorNodes = async tempWrapper => {
  const doc = getNodeDocument(tempWrapper)
  if (!doc) {
    return
  }
  const links = Array.from(tempWrapper.querySelectorAll('a'))
  for (const link of links) {
    const href = link.getAttribute('href')
    const text = link.textContent
    if (URL_REG.test(href) && href === text) {
      const title = await getPageTitle(href)
      if (title) {
        link.innerHTML = sanitize(title, PREVIEW_DOMPURIFY_CONFIG, true)
      } else {
        const span = doc.createElement('span')
        span.innerHTML = text
        link.replaceWith(span)
      }
    }
  }
}

export const standardizeHTML = async (contentState, rawHtml) => {
  rawHtml = extractBodyHtml(rawHtml)

  const sanitizedHtml = sanitize(rawHtml, PREVIEW_DOMPURIFY_CONFIG, false)
  const doc = getContentStateDocument(contentState)
  if (!doc) {
    return sanitizedHtml
  }
  const tempWrapper = doc.createElement('div')
  tempWrapper.innerHTML = sanitizedHtml

  normalizeTableNodes(tempWrapper)
  await normalizeAnchorNodes(tempWrapper)

  return tempWrapper.innerHTML
}
