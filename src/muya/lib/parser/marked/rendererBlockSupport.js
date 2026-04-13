import { escape } from './utils'

export function frontmatter (text) {
  return `<pre class="front-matter">\n${text}</pre>\n`
}

export function multiplemath (text) {
  let output = ''
  if (this.options.mathRenderer) {
    const displayMode = true
    output = this.options.mathRenderer(text, displayMode)
  }
  return output || `<pre class="multiple-math">\n${text}</pre>\n`
}

export function footnoteIdentifier (identifier, { footnoteId, footnoteIdentifierId, order }) {
  return `<a href="#${footnoteId ? `fn${footnoteId}` : ''}" class="footnote-ref" id="fnref${footnoteIdentifierId}" role="doc-noteref"><sup>${order || identifier}</sup></a>`
}

export function footnote (footnote) {
  return '<section class="footnotes" role="doc-endnotes">\n<hr />\n<ol>\n' + footnote + '</ol>\n</section>\n'
}

export function footnoteItem (content, { footnoteId, footnoteIdentifierId }) {
  return `<li id="fn${footnoteId}" role="doc-endnote">${content}<a href="#${footnoteIdentifierId ? `fnref${footnoteIdentifierId}` : ''}" class="footnote-back" role="doc-backlink">↩︎</a></li>`
}

export function code (code, infostring, escaped, codeBlockStyle) {
  const lang = (infostring || '').match(/\S*/)[0]
  if (this.options.highlight) {
    const out = this.options.highlight(code, lang)
    if (out !== null && out !== code) {
      escaped = true
      code = out
    }
  }

  let className = codeBlockStyle === 'fenced' ? 'fenced-code-block' : 'indented-code-block'
  className = lang ? `${className} ${this.options.langPrefix}${escape(lang, true)}` : className

  return '<pre><code class="' +
    className +
    '">' +
    (escaped ? code : escape(code, true)) +
    '</code></pre>\n'
}

export function blockquote (quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n'
}

export function html (html) {
  return html
}

export function heading (text, level, raw, slugger, headingStyle) {
  if (this.options.headerIds) {
    return '<h' +
      level +
      ' id="' +
      this.options.headerPrefix +
      slugger.slug(raw) +
      '" class="' +
      headingStyle +
      '">' +
      text +
      '</h' +
      level +
      '>\n'
  }
  return '<h' + level + '>' + text + '</h' + level + '>\n'
}

export function hr () {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
}

export function list (body, ordered, start, taskList) {
  const type = ordered ? 'ol' : 'ul'
  const startatt = (ordered && start !== 1) ? (' start="' + start + '"') : ''
  return '<' + type + startatt + '>\n' + body + '</' + type + '>\n'
}

export function listitem (text, checked) {
  if (checked === undefined) {
    return '<li>' + text + '</li>\n'
  }

  return '<li class="task-list-item"><input type="checkbox"' +
    (checked ? ' checked=""' : '') +
    ' disabled=""' +
    (this.options.xhtml ? ' /' : '') +
    '> ' +
    text +
    '</li>\n'
}

export function paragraph (text) {
  return '<p>' + text + '</p>\n'
}

export function table (header, body) {
  if (body) body = '<tbody>' + body + '</tbody>'

  return '<table>\n' +
    '<thead>\n' +
    header +
    '</thead>\n' +
    body +
    '</table>\n'
}

export function tablerow (content) {
  return '<tr>\n' + content + '</tr>\n'
}

export function tablecell (content, flags) {
  const type = flags.header ? 'th' : 'td'
  const tag = flags.align
    ? '<' + type + ' align="' + flags.align + '">'
    : '<' + type + '>'
  return tag + content + '</' + type + '>\n'
}

export function toc () {
  if (this.options.tocRenderer) {
    return this.options.tocRenderer()
  }
  return ''
}
