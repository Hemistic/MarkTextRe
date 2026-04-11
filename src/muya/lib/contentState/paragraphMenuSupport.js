import selection from '../selection'
import { PARAGRAPH_TYPES } from '../config'
import { normalizeParagraphType, updateHeadingOrParagraph, insertHorizontalRule } from './paragraphStyleTransforms'

export const selectionChange = (contentState, cursor) => {
  const { start, end } = cursor || selection.getCursorRange()
  if (!start || !end) {
    throw new Error('selectionChange: expected cursor but cursor is null.')
  }
  const cursorCoords = selection.getCursorCoords()
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const affiliation = startParents
    .filter(parent => endParents.includes(parent))
    .filter(parent => PARAGRAPH_TYPES.includes(parent.type))

  start.type = startBlock.type
  start.block = startBlock
  end.type = endBlock.type
  end.block = endBlock

  return {
    start,
    end,
    affiliation,
    cursorCoords
  }
}

export const getCommonParent = contentState => {
  const { start, end, affiliation } = selectionChange(contentState)
  const parent = affiliation.length ? affiliation[0] : null
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParentKeys = contentState.getParents(startBlock).map(block => block.key)
  const endParentKeys = contentState.getParents(endBlock).map(block => block.key)
  const children = parent ? parent.children : contentState.blocks
  let startIndex
  let endIndex

  for (const child of children) {
    if (startParentKeys.includes(child.key)) {
      startIndex = children.indexOf(child)
    }
    if (endParentKeys.includes(child.key)) {
      endIndex = children.indexOf(child)
    }
  }

  return { parent, startIndex, endIndex }
}

export const handleFrontMatter = contentState => {
  const firstBlock = contentState.blocks[0]
  if (firstBlock.type === 'pre' && firstBlock.functionType === 'frontmatter') return

  const { frontmatterType } = contentState.muya.options
  let lang
  let style
  switch (frontmatterType) {
    case '+':
      lang = 'toml'
      style = '+'
      break
    case ';':
      lang = 'json'
      style = ';'
      break
    case '{':
      lang = 'json'
      style = '{'
      break
    default:
      lang = 'yaml'
      style = '-'
      break
  }

  const frontMatter = contentState.createBlock('pre', {
    functionType: 'frontmatter',
    lang,
    style
  })
  const codeBlock = contentState.createBlock('code', {
    lang
  })
  const emptyCodeContent = contentState.createBlock('span', {
    functionType: 'codeContent',
    lang
  })

  contentState.appendChild(codeBlock, emptyCodeContent)
  contentState.appendChild(frontMatter, codeBlock)
  contentState.insertBefore(frontMatter, firstBlock)
  const { key } = emptyCodeContent
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const handleListMenu = (contentState, paraType, insertMode) => {
  const { start, end, affiliation } = selectionChange(contentState, contentState.cursor)
  const { orderListDelimiter, bulletListMarker, preferLooseListItem } = contentState.muya.options
  const [blockType, listType] = paraType.split('-')
  const isListed = affiliation.slice(0, 3).filter(block => /ul|ol/.test(block.type))

  if (isListed.length && !insertMode) {
    const listBlock = isListed[0]
    if (listType === listBlock.listType) {
      const listItems = listBlock.children
      listItems.forEach(listItem => {
        listItem.children.forEach(itemParagraph => {
          if (itemParagraph.type !== 'input') {
            contentState.insertBefore(itemParagraph, listBlock)
          }
        })
      })
      contentState.removeBlock(listBlock)
      return true
    }

    if (listBlock.listType === 'task') {
      const listItems = listBlock.children
      listItems.forEach(item => {
        const inputBlock = item.children[0]
        inputBlock && contentState.removeBlock(inputBlock)
      })
    }

    const oldListType = listBlock.listType
    listBlock.type = blockType
    listBlock.listType = listType
    listBlock.children.forEach(block => (block.listItemType = listType))

    if (listType === 'order') {
      listBlock.start = listBlock.start || 1
      listBlock.children.forEach(block => (block.bulletMarkerOrDelimiter = orderListDelimiter))
    }
    if (
      (listType === 'bullet' && oldListType === 'order') ||
      (listType === 'task' && oldListType === 'order')
    ) {
      delete listBlock.start
      listBlock.children.forEach(block => (block.bulletMarkerOrDelimiter = bulletListMarker))
    }

    if (listType === 'task') {
      const listItems = listBlock.children
      listItems.forEach(item => {
        const checkbox = contentState.createBlock('input')
        checkbox.checked = false
        contentState.insertBefore(checkbox, item.children[0])
      })
    }
    return true
  }

  if (start.key === end.key || (start.block.parent && start.block.parent === end.block.parent)) {
    const block = contentState.getBlock(start.key)
    const paragraph = contentState.getBlock(block.parent)
    if (listType === 'task') {
      const listItemParagraph = contentState.updateList(paragraph, 'bullet', undefined, block)
      setTimeout(() => {
        contentState.updateTaskListItem(listItemParagraph, listType)
        contentState.partialRender()
        contentState.muya.dispatchSelectionChange()
        contentState.muya.dispatchSelectionFormats()
        contentState.muya.dispatchChange()
      })
      return false
    }

    contentState.updateList(paragraph, listType, undefined, block)
    return true
  }

  const { parent, startIndex, endIndex } = getCommonParent(contentState)
  const children = parent ? parent.children : contentState.blocks
  const referBlock = children[endIndex]
  const listWrapper = contentState.createBlock(listType === 'order' ? 'ol' : 'ul')
  listWrapper.listType = listType
  if (listType === 'order') listWrapper.start = 1

  children.slice(startIndex, endIndex + 1).forEach(child => {
    if (child !== referBlock) {
      contentState.removeBlock(child, children)
    } else {
      contentState.insertAfter(listWrapper, child)
      contentState.removeBlock(child, children)
    }
    const listItem = contentState.createBlock('li')
    listItem.listItemType = listType
    listItem.isLooseListItem = preferLooseListItem
    contentState.appendChild(listWrapper, listItem)
    if (listType === 'task') {
      const checkbox = contentState.createBlock('input')
      checkbox.checked = false
      contentState.appendChild(listItem, checkbox)
    }
    contentState.appendChild(listItem, child)
  })

  return true
}

export const handleLooseListItem = contentState => {
  const { affiliation } = selectionChange(contentState, contentState.cursor)
  let listContainer = []
  if (affiliation.length >= 1 && /ul|ol/.test(affiliation[0].type)) {
    listContainer = affiliation[0].children
  } else if (affiliation.length >= 3 && affiliation[1].type === 'li') {
    listContainer = affiliation[2].children
  }
  if (listContainer.length > 0) {
    for (const block of listContainer) {
      block.isLooseListItem = !block.isLooseListItem
    }
    contentState.partialRender()
  }
}

export const handleQuoteMenu = (contentState, insertMode) => {
  const { start, end, affiliation } = selectionChange(contentState, contentState.cursor)
  let startBlock = contentState.getBlock(start.key)
  const isBlockQuote = affiliation.slice(0, 2).filter(block => /blockquote/.test(block.type))

  if (isBlockQuote.length && !insertMode) {
    const quoteBlock = isBlockQuote[0]
    const children = quoteBlock.children
    for (const child of children) {
      contentState.insertBefore(child, quoteBlock)
    }
    contentState.removeBlock(quoteBlock)
    return
  }

  if (start.key === end.key) {
    if (startBlock.type === 'span') {
      startBlock = contentState.getParent(startBlock)
    }
    const quoteBlock = contentState.createBlock('blockquote')
    contentState.insertAfter(quoteBlock, startBlock)
    contentState.removeBlock(startBlock)
    contentState.appendChild(quoteBlock, startBlock)
    return
  }

  const { parent, startIndex, endIndex } = getCommonParent(contentState)
  const children = parent ? parent.children : contentState.blocks
  const referBlock = children[endIndex]
  const quoteBlock = contentState.createBlock('blockquote')

  children.slice(startIndex, endIndex + 1).forEach(child => {
    if (child !== referBlock) {
      contentState.removeBlock(child, children)
    } else {
      contentState.insertAfter(quoteBlock, child)
      contentState.removeBlock(child, children)
    }
    contentState.appendChild(quoteBlock, child)
  })
}

export const showTablePicker = contentState => {
  const { eventCenter } = contentState.muya
  const reference = contentState.getPositionReference()
  const handler = (rows, columns) => {
    contentState.createTable({ rows: rows + 1, columns: columns + 1 })
  }
  eventCenter.dispatch('muya-table-picker', { row: -1, column: -1 }, reference, handler.bind(contentState))
}

export const updateParagraph = (contentState, paraType, insertMode = false) => {
  const { start, end } = contentState.cursor
  const block = contentState.getBlock(start.key)
  let needDispatchChange = true

  if (!contentState.isAllowedTransformation(block, paraType, start.key !== end.key)) {
    return
  }

  paraType = normalizeParagraphType(contentState, paraType, block)
  if (!paraType) {
    return
  }

  switch (paraType) {
    case 'front-matter':
      handleFrontMatter(contentState)
      break
    case 'ul-bullet':
    case 'ul-task':
    case 'ol-order':
      needDispatchChange = handleListMenu(contentState, paraType, insertMode)
      break
    case 'loose-list-item':
      handleLooseListItem(contentState)
      break
    case 'pre':
      contentState.handleCodeBlockMenu()
      break
    case 'blockquote':
      handleQuoteMenu(contentState, insertMode)
      break
    case 'mathblock':
      contentState.insertContainerBlock('multiplemath', block)
      break
    case 'table':
      showTablePicker(contentState)
      break
    case 'html':
      contentState.insertHtmlBlock(block)
      break
    case 'flowchart':
    case 'sequence':
    case 'plantuml':
    case 'mermaid':
    case 'vega-lite':
      contentState.insertContainerBlock(paraType, block)
      break
    case 'heading 1':
    case 'heading 2':
    case 'heading 3':
    case 'heading 4':
    case 'heading 5':
    case 'heading 6':
    case 'upgrade heading':
    case 'degrade heading':
    case 'paragraph':
      if (!updateHeadingOrParagraph(contentState, paraType, block)) {
        return
      }
      break
    case 'hr':
      insertHorizontalRule(contentState, block)
      break
  }

  if (paraType === 'front-matter' || paraType === 'pre') {
    contentState.render()
  } else {
    contentState.partialRender()
  }

  if (needDispatchChange) {
    contentState.muya.dispatchSelectionChange()
    contentState.muya.dispatchSelectionFormats()
    contentState.muya.dispatchChange()
  }
}
