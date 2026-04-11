import { PARAGRAPH_TYPES, PREVIEW_DOMPURIFY_CONFIG, URL_REG } from '../config'
import { sanitize } from '../utils'
import { resolvePasteFragments, applyPasteFragments } from './pasteFragments'

const LIST_REG = /ul|ol/
const LINE_BREAKS_REG = /\n/

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

export const checkCopyType = (html, rawText) => {
  let type = 'normal'
  if (!html && rawText) {
    type = 'copyAsMarkdown'
    const match = /^<([a-zA-Z\d-]+)(?=\s|>).*?>[\s\S]+?<\/([a-zA-Z\d-]+)>$/.exec(rawText.trim())
    if (match && match[1]) {
      const tag = match[1]
      if (tag === 'table' && match.length === 3 && match[2] === 'table') {
        const tmp = document.createElement('table')
        tmp.innerHTML = sanitize(rawText, PREVIEW_DOMPURIFY_CONFIG, false)
        if (tmp.childElementCount === 1) {
          return 'htmlToMd'
        }
      }

      type = PARAGRAPH_TYPES.find(type => type === tag) ? 'copyAsHtml' : type
    }
  }
  return type
}

export const handleDocPaste = async (contentState, event) => {
  const file = await contentState.pasteImage(event)
  if (file) {
    event.preventDefault()
    return true
  }

  if (contentState.selectedTableCells) {
    const { start } = contentState.cursor
    const startBlock = contentState.getBlock(start.key)
    const { selectedTableCells: stc } = contentState

    if (startBlock && startBlock.functionType === 'cellContent' && stc.row === 1 && stc.column === 1) {
      contentState.pasteHandler(event)
      event.preventDefault()
      return true
    }
  }

  return false
}

const appendHtmlAtCursor = (contentState, startBlock, start, text) => {
  startBlock.text = startBlock.text.substring(0, start.offset) + text + startBlock.text.substring(start.offset)
  const { key } = start
  const offset = start.offset + text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

const pasteIntoLanguageInput = (contentState, startBlock, start, end, text) => {
  let language = text.trim().match(/^.*$/m)[0] || ''
  const oldLanguageLength = startBlock.text.length
  let offset = 0
  if (start.offset !== 0 || end.offset !== oldLanguageLength) {
    const prePartText = startBlock.text.substring(0, start.offset)
    const postPartText = startBlock.text.substring(end.offset)
    language = prePartText + language + postPartText
    offset = prePartText.length + language.length
  } else {
    offset = language.length
  }

  startBlock.text = language
  const key = startBlock.key
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  contentState.muya.eventCenter.dispatch('muya-code-picker', { reference: null })
  contentState.updateCodeLanguage(startBlock, language)
}

const pasteIntoCodeContent = (contentState, startBlock, start, end, text) => {
  const blockText = startBlock.text
  const prePartText = blockText.substring(0, start.offset)
  const postPartText = blockText.substring(end.offset)
  startBlock.text = prePartText + text + postPartText
  const { key } = startBlock
  const offset = start.offset + text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  contentState.partialRender()
}

const pasteIntoTableCell = (contentState, startBlock, start, end, text) => {
  let isOneCellSelected = false
  if (contentState.selectedTableCells) {
    const { selectedTableCells: stc } = contentState
    if (stc.row === 1 && stc.column === 1) {
      isOneCellSelected = true
    } else {
      contentState.partialRender()
      return true
    }
  }

  const { key } = startBlock
  const pendingText = text.trim().replace(/\n/g, '<br/>')
  let offset = pendingText.length
  if (isOneCellSelected) {
    startBlock.text = pendingText
    contentState.selectedTableCells = null
  } else {
    offset += start.offset
    startBlock.text = startBlock.text.substring(0, start.offset) + pendingText + startBlock.text.substring(end.offset)
  }

  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}

const handleCopyAsHtml = (contentState, type, text, startBlock, parent, appendHtml) => {
  switch (type) {
    case 'normal': {
      const htmlBlock = contentState.createBlockP(text.trim())
      contentState.insertAfter(htmlBlock, parent)
      contentState.removeBlock(parent)
      contentState.insertHtmlBlock(htmlBlock)
      break
    }
    case 'pasteAsPlainText': {
      const lines = text.trim().split(LINE_BREAKS_REG)
      let htmlBlock = null

      if (!startBlock.text || lines.length > 1) {
        htmlBlock = contentState.createBlockP((startBlock.text ? lines.slice(1) : lines).join('\n'))
      }
      if (htmlBlock) {
        contentState.insertAfter(htmlBlock, parent)
        contentState.insertHtmlBlock(htmlBlock)
      }
      if (startBlock.text) {
        appendHtml(lines[0])
      } else {
        contentState.removeBlock(parent)
      }
      break
    }
  }
  contentState.partialRender()
}

export const pasteHandler = async (contentState, event, type = 'normal', rawText, rawHtml) => {
  event.preventDefault()
  event.stopPropagation()

  const text = rawText || event.clipboardData.getData('text/plain')
  let html = rawHtml || event.clipboardData.getData('text/html')

  if (URL_REG.test(text) && !/\s/.test(text) && !html) {
    html = `<a href="${text}">${text}</a>`
  }

  html = await contentState.standardizeHTML(html)

  let copyType = contentState.checkCopyType(html, text)
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const parent = contentState.getParent(startBlock)

  if (copyType === 'htmlToMd') {
    html = sanitize(text, PREVIEW_DOMPURIFY_CONFIG, false)
    copyType = 'normal'
  }

  if (start.key !== end.key) {
    contentState.cutHandler()
    return contentState.pasteHandler(event, type, rawText, rawHtml)
  }

  if (!html) {
    const file = await contentState.pasteImage(event)
    if (file) {
      return
    }
  }

  const appendHtml = appendHtmlAtCursor.bind(null, contentState, startBlock, start)

  if (startBlock.type === 'span' && startBlock.functionType === 'languageInput') {
    pasteIntoLanguageInput(contentState, startBlock, start, end, text)
    return
  }

  if (startBlock.type === 'span' && startBlock.functionType === 'codeContent') {
    pasteIntoCodeContent(contentState, startBlock, start, end, text)
    return
  }

  if (startBlock.functionType === 'cellContent') {
    if (pasteIntoTableCell(contentState, startBlock, start, end, text)) {
      return
    }
  }

  if (copyType === 'copyAsHtml') {
    handleCopyAsHtml(contentState, type, text, startBlock, parent, appendHtml)
    return
  }

  const stateFragments = await resolvePasteFragments(contentState, type, copyType, text, html)

  if (stateFragments.length <= 0) {
    return
  }

  const { cursor, cursorBlock } = applyPasteFragments(
    contentState,
    startBlock,
    endBlock,
    parent,
    stateFragments,
    start.offset,
    end.offset,
    contentState.checkPasteType.bind(contentState),
    fragmentType => LIST_REG.test(fragmentType)
  )

  contentState.cursor = cursor
  contentState.checkInlineUpdate(cursorBlock)
  contentState.partialRender()
  contentState.muya.dispatchSelectionChange()
  contentState.muya.dispatchSelectionFormats()
  contentState.muya.dispatchChange()
}
