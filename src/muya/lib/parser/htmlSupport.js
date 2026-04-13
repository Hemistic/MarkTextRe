// selected from https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
export const WHITELIST_ATTRIBUTES = Object.freeze([
  'align', 'alt', 'checked', 'class', 'color', 'dir', 'disabled', 'for', 'height', 'hidden',
  'href', 'id', 'lang', 'lazyload', 'rel', 'spellcheck', 'src', 'srcset', 'start', 'style',
  'target', 'title', 'type', 'value', 'width',
  'data-align'
])

const validWidthAndHeight = value => {
  if (!/^\d{1,}$/.test(value)) return ''
  value = parseInt(value)
  return value >= 0 ? value : ''
}

export const getAttributes = html => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const target = doc.querySelector('body').firstElementChild
  if (!target) return null
  const attrs = {}
  if (target.tagName === 'IMG') {
    Object.assign(attrs, {
      title: '',
      src: '',
      alt: ''
    })
  }
  for (const attr of target.getAttributeNames()) {
    if (!WHITELIST_ATTRIBUTES.includes(attr)) continue
    if (/width|height/.test(attr)) {
      attrs[attr] = validWidthAndHeight(target.getAttribute(attr))
    } else {
      attrs[attr] = target.getAttribute(attr)
    }
  }

  return attrs
}

export const parseSrcAndTitle = (text = '') => {
  const parts = text.split(/\s+/)
  if (parts.length === 1) {
    return {
      src: text.trim(),
      title: ''
    }
  }
  const rawTitle = text.replace(/^[^ ]+ +/, '')
  let src = ''
  const TITLE_REG = /^('|")(.*?)\1$/
  let title = ''
  if (rawTitle && TITLE_REG.test(rawTitle)) {
    title = rawTitle.replace(TITLE_REG, '$2')
  }
  if (title) {
    src = text.substring(0, text.length - rawTitle.length).trim()
  } else {
    src = text.trim()
  }
  return { src, title }
}
