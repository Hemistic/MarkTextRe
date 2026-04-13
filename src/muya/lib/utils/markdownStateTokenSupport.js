import { ensureLanguageLoaded } from '../prism/runtimeSupport'

const SPECIAL_CONTAINER_LANG_REG = /mermaid|flowchart|vega-lite|sequence|plantuml/

const restoreTableEscapeCharacters = text => text.replace(/\|/g, '\\|')

const createParagraphWithText = (contentState, text) => {
  const block = contentState.createBlock('p')
  const contentBlock = contentState.createBlock('span', { text })
  contentState.appendChild(block, contentBlock)
  return block
}

const createCodeStructure = (contentState, { value, lang, functionType, style }) => {
  const block = contentState.createBlock('pre', {
    functionType,
    lang,
    style
  })
  const codeBlock = contentState.createBlock('code', { lang })
  const codeContent = contentState.createBlock('span', {
    text: value,
    lang,
    functionType: 'codeContent'
  })

  contentState.appendChild(codeBlock, codeContent)
  contentState.appendChild(block, codeBlock)
  return block
}

const scheduleLanguageRender = (contentState, languageLoaded, lang) => {
  if (!lang || languageLoaded.has(lang)) return

  languageLoaded.add(lang)
  ensureLanguageLoaded(lang)
    .then(infoList => {
      if (!Array.isArray(infoList)) return
      const needRender = infoList.some(({ status }) => status === 'loaded')
      if (needRender) contentState.render()
    })
    .catch(err => {
      console.warn(err)
    })
}

const handleFrontmatter = ({ contentState, parentList }, token) => {
  const value = token.text.replace(/^\s+/, '').replace(/\s$/, '')
  const block = createCodeStructure(contentState, {
    value,
    lang: token.lang,
    style: token.style,
    functionType: token.type
  })
  contentState.appendChild(parentList[0], block)
}

const handleHr = ({ contentState, parentList }, token) => {
  const block = contentState.createBlock('hr')
  const thematicBreakContent = contentState.createBlock('span', {
    text: token.marker,
    functionType: 'thematicBreakLine'
  })
  contentState.appendChild(block, thematicBreakContent)
  contentState.appendChild(parentList[0], block)
}

const handleHeading = ({ contentState, parentList }, token) => {
  const { headingStyle, depth, text, marker } = token
  const value = headingStyle === 'atx' ? '#'.repeat(+depth) + ` ${text}` : text
  const block = contentState.createBlock(`h${depth}`, { headingStyle })
  const headingContent = contentState.createBlock('span', {
    text: value,
    functionType: headingStyle === 'atx' ? 'atxLine' : 'paragraphContent'
  })
  contentState.appendChild(block, headingContent)
  if (marker) block.marker = marker
  contentState.appendChild(parentList[0], block)
}

const handleMultipleMath = ({ contentState, parentList }, token) => {
  const block = contentState.createContainerBlock(token.type, token.text, token.mathStyle)
  contentState.appendChild(parentList[0], block)
}

const handleCode = ({ contentState, parentList, languageLoaded, trimUnnecessaryCodeBlockEmptyLines }, token) => {
  const { codeBlockStyle, text, lang: infostring = '' } = token
  const lang = (infostring || '').match(/\S*/)[0]

  let value = text
  if (trimUnnecessaryCodeBlockEmptyLines && (value.endsWith('\n') || value.startsWith('\n'))) {
    value = value.replace(/\n+$/, '').replace(/^\n+/, '')
  }

  if (SPECIAL_CONTAINER_LANG_REG.test(lang)) {
    const block = contentState.createContainerBlock(lang, value)
    contentState.appendChild(parentList[0], block)
    return
  }

  const block = contentState.createBlock('pre', {
    functionType: codeBlockStyle === 'fenced' ? 'fencecode' : 'indentcode',
    lang
  })
  const codeBlock = contentState.createBlock('code', { lang })
  const codeContent = contentState.createBlock('span', {
    text: value,
    lang,
    functionType: 'codeContent'
  })
  const inputBlock = contentState.createBlock('span', {
    text: lang,
    functionType: 'languageInput'
  })

  scheduleLanguageRender(contentState, languageLoaded, lang)
  contentState.appendChild(codeBlock, codeContent)
  contentState.appendChild(block, inputBlock)
  contentState.appendChild(block, codeBlock)
  contentState.appendChild(parentList[0], block)
}

const handleTable = ({ contentState, parentList }, token) => {
  const { header, align, cells } = token
  const table = contentState.createBlock('table')
  const thead = contentState.createBlock('thead')
  const tbody = contentState.createBlock('tbody')
  const theadRow = contentState.createBlock('tr')

  for (let i = 0; i < header.length; i++) {
    const th = contentState.createBlock('th', {
      align: align[i] || '',
      column: i
    })
    const cellContent = contentState.createBlock('span', {
      text: restoreTableEscapeCharacters(header[i]),
      functionType: 'cellContent'
    })
    contentState.appendChild(th, cellContent)
    contentState.appendChild(theadRow, th)
  }

  for (let i = 0; i < cells.length; i++) {
    const rowBlock = contentState.createBlock('tr')
    const rowContents = cells[i]
    for (let j = 0; j < rowContents.length; j++) {
      const td = contentState.createBlock('td', {
        align: align[j] || '',
        column: j
      })
      const cellContent = contentState.createBlock('span', {
        text: restoreTableEscapeCharacters(rowContents[j]),
        functionType: 'cellContent'
      })
      contentState.appendChild(td, cellContent)
      contentState.appendChild(rowBlock, td)
    }
    contentState.appendChild(tbody, rowBlock)
  }

  Object.assign(table, { row: cells.length, column: header.length - 1 })
  const block = contentState.createBlock('figure')
  block.functionType = 'table'
  contentState.appendChild(thead, theadRow)
  contentState.appendChild(block, table)
  contentState.appendChild(table, thead)
  if (tbody.children.length) contentState.appendChild(table, tbody)
  contentState.appendChild(parentList[0], block)
}

const handleHtml = ({ contentState, parentList }, token) => {
  const text = token.text.trim()
  if (/^<img[^<>]+>$/.test(text)) {
    const block = createParagraphWithText(contentState, text)
    contentState.appendChild(parentList[0], block)
    return
  }

  const block = contentState.createHtmlBlock(text)
  contentState.appendChild(parentList[0], block)
}

const handleTextParagraph = ({ contentState, parentList }, token, tokens) => {
  let value = token.text
  while (tokens[0] && tokens[0].type === 'text') {
    value += `\n${tokens.shift().text}`
  }
  const block = createParagraphWithText(contentState, value)
  contentState.appendChild(parentList[0], block)
}

const handleSimpleParagraph = ({ contentState, parentList }, token) => {
  const block = createParagraphWithText(contentState, token.text)
  contentState.appendChild(parentList[0], block)
}

const handleBlockquoteStart = ({ contentState, parentList }) => {
  const block = contentState.createBlock('blockquote')
  contentState.appendChild(parentList[0], block)
  parentList.unshift(block)
}

const handleBlockquoteEnd = ({ contentState, parentList }) => {
  if (parentList[0].children.length === 0) {
    const paragraphBlock = contentState.createBlockP()
    contentState.appendChild(parentList[0], paragraphBlock)
  }
  parentList.shift()
}

const handleFootnoteStart = ({ contentState, parentList }, token) => {
  const block = contentState.createBlock('figure', {
    functionType: 'footnote'
  })
  const identifierInput = contentState.createBlock('span', {
    text: token.identifier,
    functionType: 'footnoteInput'
  })
  contentState.appendChild(block, identifierInput)
  contentState.appendChild(parentList[0], block)
  parentList.unshift(block)
}

const handleListStart = ({ contentState, parentList }, token) => {
  const { ordered, listType, start } = token
  const block = contentState.createBlock(ordered === true ? 'ol' : 'ul')
  block.listType = listType
  if (listType === 'order') {
    block.start = /^\d+$/.test(start) ? start : 1
  }
  contentState.appendChild(parentList[0], block)
  parentList.unshift(block)
}

const handleListItemStart = ({ contentState, parentList }, token) => {
  const { listItemType, bulletMarkerOrDelimiter, checked, type } = token
  const block = contentState.createBlock('li', {
    listItemType: checked !== undefined ? 'task' : listItemType,
    bulletMarkerOrDelimiter,
    isLooseListItem: type === 'loose_item_start'
  })

  if (checked !== undefined) {
    const input = contentState.createBlock('input', { checked })
    contentState.appendChild(block, input)
  }

  contentState.appendChild(parentList[0], block)
  parentList.unshift(block)
}

export const createMarkdownStateContext = (contentState, languageLoaded) => {
  const root = {
    key: null,
    type: 'root',
    text: '',
    parent: null,
    preSibling: null,
    nextSibling: null,
    children: []
  }

  return {
    contentState,
    root,
    parentList: [root],
    languageLoaded,
    trimUnnecessaryCodeBlockEmptyLines: contentState.muya.options.trimUnnecessaryCodeBlockEmptyLines
  }
}

export const getMarkdownStateResult = ({ contentState, root }) => {
  return root.children.length ? root.children : [contentState.createBlockP()]
}

export const handleMarkdownStateToken = (context, token, tokens) => {
  switch (token.type) {
    case 'frontmatter':
      handleFrontmatter(context, token)
      break
    case 'hr':
      handleHr(context, token)
      break
    case 'heading':
      handleHeading(context, token)
      break
    case 'multiplemath':
      handleMultipleMath(context, token)
      break
    case 'code':
      handleCode(context, token)
      break
    case 'table':
      handleTable(context, token)
      break
    case 'html':
      handleHtml(context, token)
      break
    case 'text':
      handleTextParagraph(context, token, tokens)
      break
    case 'toc':
    case 'paragraph':
      handleSimpleParagraph(context, token)
      break
    case 'blockquote_start':
      handleBlockquoteStart(context)
      break
    case 'blockquote_end':
      handleBlockquoteEnd(context)
      break
    case 'footnote_start':
      handleFootnoteStart(context, token)
      break
    case 'footnote_end':
    case 'list_end':
    case 'list_item_end':
      context.parentList.shift()
      break
    case 'list_start':
      handleListStart(context, token)
      break
    case 'loose_item_start':
    case 'list_item_start':
      handleListItemStart(context, token)
      break
    case 'space':
      break
    default:
      console.warn(`Unknown type ${token.type}`)
      break
  }
}
