import runSanitize from './dompurify'

const HTML_TAG_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export const escapeHTML = str =>
  str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )

export const unescapeHTML = str =>
  str.replace(
    /(?:&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    tag =>
      ({
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
        '&quot;': '"'
      }[tag] || tag)
  )

export const escapeInBlockHtml = html => {
  return html
    .replace(/(<(style|script|title)[^<>]*>)([\s\S]*?)(<\/\2>)/g, (m, p1, p2, p3, p4) => {
      return `${escapeHTML(p1)}${p3}${escapeHTML(p4)}`
    })
}

export const escapeHtmlTags = html => {
  return html.replace(/[&<>"']/g, x => HTML_TAG_REPLACEMENTS[x])
}

export const sanitize = (html, purifyOptions, disableHtml) => {
  if (disableHtml) {
    return runSanitize(escapeHtmlTags(html), purifyOptions)
  } else {
    return runSanitize(escapeInBlockHtml(html), purifyOptions)
  }
}
