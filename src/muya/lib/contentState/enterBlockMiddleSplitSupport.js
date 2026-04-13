import selection from '../selection'

export const splitBlockMiddle = (contentState, context, start) => {
  const { block, paragraph, text, left, type } = context
  let newBlock
  let { pre, post } = selection.chopHtmlByCursor(paragraph)

  if (/^h\d$/.test(block.type)) {
    if (block.headingStyle === 'atx') {
      const prefix = /^#+/.exec(pre)[0]
      post = `${prefix} ${post}`
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
  return newBlock
}
