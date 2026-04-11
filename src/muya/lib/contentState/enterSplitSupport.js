import selection from '../selection'

export const prepareEnterBlock = (contentState, block, start) => {
  let parent = contentState.getParent(block)

  if (block.type === 'span') {
    block = parent
    parent = contentState.getParent(block)
  }

  if (
    (parent && parent.type === 'li' && contentState.isOnlyChild(block)) ||
    (parent && parent.type === 'li' && parent.listItemType === 'task' && parent.children.length === 2)
  ) {
    block = parent
    parent = contentState.getParent(block)
  }

  const paragraph = document.querySelector(`#${block.key}`)
  const text = contentState.getBlock(start.key).text
  const left = start.offset
  const right = text.length - left

  return {
    block,
    paragraph,
    parent,
    text,
    left,
    right,
    type: block.type
  }
}

export const splitBlockOnEnter = (contentState, context, start) => {
  const { block, paragraph, text, left, right, type } = context
  let newBlock

  switch (true) {
    case left !== 0 && right !== 0: {
      let { pre, post } = selection.chopHtmlByCursor(paragraph)
      if (/^h\d$/.test(block.type)) {
        if (block.headingStyle === 'atx') {
          const PREFIX = /^#+/.exec(pre)[0]
          post = `${PREFIX} ${post}`
        }
        block.children[0].text = pre
        newBlock = contentState.createBlock(type, {
          headingStyle: block.headingStyle
        })
        const headerContent = contentState.createBlock('span', {
          text: post,
          functionType: block.headingStyle === 'atx' ? 'atxLine' : 'paragraphContent'
        })
        contentState.appendChild(newBlock, headerContent)
        if (block.marker) {
          newBlock.marker = block.marker
        }
      } else if (block.type === 'p') {
        newBlock = contentState.chopBlockByCursor(block, start.key, start.offset)
      } else if (type === 'li') {
        if (block.listItemType === 'task') {
          const { checked } = block.children[0]
          newBlock = contentState.chopBlockByCursor(block.children[1], start.key, start.offset)
          newBlock = contentState.createTaskItemBlock(newBlock, checked)
        } else {
          newBlock = contentState.chopBlockByCursor(block.children[0], start.key, start.offset)
          newBlock = contentState.createBlockLi(newBlock)
          newBlock.listItemType = block.listItemType
          newBlock.bulletMarkerOrDelimiter = block.bulletMarkerOrDelimiter
        }
        newBlock.isLooseListItem = block.isLooseListItem
      } else if (block.type === 'hr') {
        const preText = text.substring(0, left)
        const postText = text.substring(left)

        if (preText.replace(/ /g, '').length < 3) {
          block.type = 'p'
          block.children[0].functionType = 'paragraphContent'
        }

        if (postText.replace(/ /g, '').length >= 3) {
          newBlock = contentState.createBlock('hr')
          const content = contentState.createBlock('span', {
            functionType: 'thematicBreakLine',
            text: postText
          })
          contentState.appendChild(newBlock, content)
        } else {
          newBlock = contentState.createBlockP(postText)
        }

        block.children[0].text = preText
      }

      contentState.insertAfter(newBlock, block)
      break
    }
    case left === 0 && right === 0:
      contentState.enterInEmptyParagraph(block)
      return null
    case left !== 0 && right === 0:
    case left === 0 && right !== 0: {
      if (type === 'li') {
        if (block.listItemType === 'task') {
          newBlock = contentState.createTaskItemBlock(null, false)
        } else {
          newBlock = contentState.createBlockLi()
          newBlock.listItemType = block.listItemType
          newBlock.bulletMarkerOrDelimiter = block.bulletMarkerOrDelimiter
        }
        newBlock.isLooseListItem = block.isLooseListItem
      } else {
        newBlock = contentState.createBlockP()
      }

      if (left === 0 && right !== 0) {
        contentState.insertBefore(newBlock, block)
        newBlock = block
      } else {
        if (block.type === 'p') {
          const lastLine = block.children[block.children.length - 1]
          if (lastLine.text === '') {
            contentState.removeBlock(lastLine)
          }
        }
        contentState.insertAfter(newBlock, block)
      }
      break
    }
    default:
      newBlock = contentState.createBlockP()
      contentState.insertAfter(newBlock, block)
      break
  }

  return newBlock
}

export const finalizeEnter = (contentState, block, newBlock, getParagraphBlock) => {
  contentState.codeBlockUpdate(getParagraphBlock(newBlock))
  const preParagraphBlock = getParagraphBlock(block)
  const blockNeedFocus = contentState.codeBlockUpdate(preParagraphBlock)
  const tableNeedFocus = contentState.tableBlockUpdate(preParagraphBlock)
  const htmlNeedFocus = contentState.updateHtmlBlock(preParagraphBlock)
  const mathNeedFocus = contentState.updateMathBlock(preParagraphBlock)
  let cursorBlock

  switch (true) {
    case !!blockNeedFocus:
      cursorBlock = block
      break
    case !!tableNeedFocus:
      cursorBlock = tableNeedFocus
      break
    case !!htmlNeedFocus:
      cursorBlock = htmlNeedFocus.children[0].children[0]
      break
    case !!mathNeedFocus:
      cursorBlock = mathNeedFocus
      break
    default:
      cursorBlock = newBlock
      break
  }

  cursorBlock = getParagraphBlock(cursorBlock)
  const key = cursorBlock.type === 'p' || cursorBlock.type === 'pre' ? cursorBlock.children[0].key : cursorBlock.key
  let offset = 0

  if (htmlNeedFocus) {
    const { text } = cursorBlock
    const match = /^[^\n]+\n[^\n]*/.exec(text)
    offset = match && match[0] ? match[0].length : 0
  }

  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  let needRenderAll = false
  if (contentState.isCollapse() && cursorBlock.type === 'p') {
    contentState.checkInlineUpdate(cursorBlock.children[0])
    needRenderAll = true
  }

  needRenderAll ? contentState.render() : contentState.partialRender()
}
