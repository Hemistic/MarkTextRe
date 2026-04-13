import { cleanUrl, escape } from './utils'

export function inlineMath (math) {
  let output = ''
  if (this.options.mathRenderer) {
    const displayMode = false
    output = this.options.mathRenderer(math, displayMode)
  }
  return output || math
}

export function emoji (text, emoji) {
  if (this.options.emojiRenderer) {
    return this.options.emojiRenderer(emoji)
  } else {
    return text
  }
}

export function script (content, marker) {
  const tagName = marker === '^' ? 'sup' : 'sub'
  return `<${tagName}>${content}</${tagName}>`
}

export function strong (text) {
  return '<strong>' + text + '</strong>'
}

export function em (text) {
  return '<em>' + text + '</em>'
}

export function codespan (text) {
  return '<code>' + text + '</code>'
}

export function br () {
  return this.options.xhtml ? '<br/>' : '<br>'
}

export function del (text) {
  return '<del>' + text + '</del>'
}

export function link (href, title, text) {
  href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
  if (href === null) {
    return text
  }
  let out = '<a href="' + escape(href) + '"'
  if (title) {
    out += ' title="' + title + '"'
  }
  out += '>' + text + '</a>'
  return out
}

export function image (href, title, text) {
  if (!href) {
    return text
  }

  if (/^(?:[a-zA-Z]:\\|[a-zA-Z]:\/).+/.test(href)) {
    href = 'file:///' + href.replace(/\\/g, '/')
  } else if (/^\\\?\\.+/.test(href)) {
    href = 'file:///' + href.substring(3).replace(/\\/g, '/')
  } else if (/^\/.+/.test(href)) {
    href = 'file://' + href
  }

  href = cleanUrl(this.options.sanitize, this.options.baseUrl, href)
  if (href === null) {
    return text
  }

  let out = '<img src="' + href + '" alt="' + text.replace(/\*/g, '') + '"'
  if (title) {
    out += ' title="' + title + '"'
  }
  out += this.options.xhtml ? '/>' : '>'
  return out
}

export function text (text) {
  return text
}
