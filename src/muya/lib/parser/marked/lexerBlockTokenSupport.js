import { splitCells, rtrim, getUniqueId, escape } from './utils'

const normalizeTableAlign = align => {
  if (/^ *-+: *$/.test(align)) {
    return 'right'
  } else if (/^ *:-+: *$/.test(align)) {
    return 'center'
  } else if (/^ *:-+ *$/.test(align)) {
    return 'left'
  }

  return null
}

export const createTableToken = (header, alignRow, bodyRows, hasLeadingPipe = false) => {
  const headerCells = splitCells(header.replace(/^ *| *\| *$/g, ''))
  const align = alignRow.replace(/^ *|\| *$/g, '').split(/ *\| */)

  if (headerCells.length !== align.length) {
    return null
  }

  const cells = (bodyRows ? bodyRows.replace(/\n$/, '').split('\n') : []).map(row => {
    const normalizedRow = hasLeadingPipe ? row.replace(/^ *\| *| *\| *$/g, '') : row
    return splitCells(normalizedRow, headerCells.length)
  })

  return {
    type: 'table',
    header: headerCells,
    align: align.map(normalizeTableAlign),
    cells
  }
}

export const createSpaceToken = () => ({
  type: 'space'
})

export const createIndentedCodeToken = (raw, pedantic) => {
  const text = raw.replace(/^ {4}/gm, '')
  return {
    type: 'code',
    codeBlockStyle: 'indented',
    text: !pedantic ? rtrim(text, '\n') : text
  }
}

export const indentCodeCompensation = (raw, text) => {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/)

  if (matchIndentToCode === null) {
    return text
  }

  const indentToCode = matchIndentToCode[1]

  return text
    .split('\n')
    .map(node => {
      const matchIndentInNode = node.match(/^\s+/)
      if (matchIndentInNode === null) {
        return node
      }

      const [indentInNode] = matchIndentInNode

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length)
      }

      return node
    })
    .join('\n')
}

export const createMultipleMathToken = (text, mathStyle = '') => ({
  type: 'multiplemath',
  text,
  mathStyle
})

export const registerFootnote = (tokens, identifier, order) => {
  tokens.push({
    type: 'footnote_start',
    identifier
  })

  tokens.footnotes[identifier] = {
    order,
    identifier,
    footnoteId: getUniqueId()
  }
}

export const createFenceCodeToken = cap => {
  const raw = cap[0]
  const text = indentCodeCompensation(raw, cap[3] || '')
  return {
    type: 'code',
    codeBlockStyle: 'fenced',
    lang: cap[2] ? cap[2].trim() : cap[2],
    text
  }
}

export const createAtxHeadingToken = (cap, pedantic) => {
  let text = cap[2] ? cap[2].trim() : ''

  if (text.endsWith('#')) {
    const trimmed = rtrim(text, '#')

    if (pedantic) {
      text = trimmed.trim()
    } else if (!trimmed || trimmed.endsWith(' ')) {
      text = trimmed.trim()
    }
  }

  return {
    type: 'heading',
    headingStyle: 'atx',
    depth: cap[1].length,
    text
  }
}

export const createHrToken = raw => ({
  type: 'hr',
  marker: raw.replace(/\n*$/, '')
})

export const createHtmlToken = (cap, options) => ({
  type: options.sanitize ? 'paragraph' : 'html',
  pre: !options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
  text: options.sanitize
    ? (options.sanitizer ? options.sanitizer(cap[0]) : escape(cap[0]))
    : cap[0]
})

export const createFrontmatterToken = cap => {
  let lang
  let style
  let text

  if (cap[1]) {
    lang = 'yaml'
    style = '-'
    text = cap[1]
  } else if (cap[2]) {
    lang = 'toml'
    style = '+'
    text = cap[2]
  } else if (cap[3] || cap[4]) {
    lang = 'json'
    style = cap[3] ? ';' : '{'
    text = cap[3] || cap[4]
  }

  return {
    type: 'frontmatter',
    text,
    style,
    lang
  }
}

export const createSetextHeadingToken = (cap, precededToken) => {
  const chops = cap[0].trim().split(/\n/)
  const marker = chops[chops.length - 1]

  return {
    type: 'heading',
    headingStyle: 'setext',
    depth: cap[2].charAt(0) === '=' ? 1 : 2,
    text: precededToken && precededToken.type === 'paragraph'
      ? precededToken.text + '\n' + cap[1]
      : cap[1],
    marker
  }
}

export const createParagraphToken = text => {
  if (/^\[toc\]\n?$/i.test(text)) {
    return { type: 'toc', text: '[TOC]' }
  }

  return {
    type: 'paragraph',
    text: text.charAt(text.length - 1) === '\n'
      ? text.slice(0, -1)
      : text
  }
}

export const createTextToken = text => ({
  type: 'text',
  text
})

export const consumeDefinition = (tokens, cap) => {
  const normalizedTitle = cap[3] ? cap[3].substring(1, cap[3].length - 1) : cap[3]
  const tag = cap[1].toLowerCase().replace(/\s+/g, ' ')

  if (!tokens.links[tag]) {
    tokens.links[tag] = {
      href: cap[2],
      title: normalizedTitle
    }
  }

  return {
    raw: cap[0],
    tag
  }
}
