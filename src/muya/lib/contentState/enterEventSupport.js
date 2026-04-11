const checkAutoIndent = (text, offset) => {
  const pairStr = text.substring(offset - 1, offset + 1)
  return /^(\{\}|\[\]|\(\)|><)$/.test(pairStr)
}

const getIndentSpace = text => {
  const match = /^(\s*)\S/.exec(text)
  return match ? match[1] : ''
}

export const handleDocEnter = (contentState, event) => {
  const { eventCenter } = contentState.muya
  const { selectedImage } = contentState
  if (!selectedImage) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  const { imageId, ...imageInfo } = selectedImage
  const imageWrapper = document.querySelector(`#${imageId}`)
  if (!imageWrapper) {
    contentState.selectedImage = null
    return true
  }
  const rect = imageWrapper.getBoundingClientRect()
  const reference = {
    getBoundingClientRect () {
      rect.height = 0
      return rect
    }
  }

  eventCenter.dispatch('muya-image-selector', {
    reference,
    imageInfo,
    cb: () => {}
  })
  contentState.selectedImage = null

  return true
}

export const normalizeSelectionBeforeEnter = (contentState, start, end) => {
  const block = contentState.getBlock(start.key)
  if (start.key !== end.key) {
    const endBlock = contentState.getBlock(end.key)
    const key = start.key
    const offset = start.offset
    const startRemainText = block.text.substring(0, start.offset)
    const endRemainText = endBlock.text.substring(end.offset)

    block.text = startRemainText + endRemainText
    contentState.removeBlocks(block, endBlock)
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  if (start.offset !== end.offset) {
    const key = start.key
    const offset = start.offset
    block.text = block.text.substring(0, start.offset) + block.text.substring(end.offset)
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  return false
}

export const handleFootnoteEnter = (contentState, event, block, start, footnoteReg) => {
  const { text } = block
  if (
    block.type === 'span' &&
    block.functionType === 'paragraphContent' &&
    !contentState.getParent(block).parent &&
    start.offset === text.length &&
    footnoteReg.test(text)
  ) {
    event.preventDefault()
    event.stopPropagation()
    block.text += ' '
    const key = block.key
    const offset = block.text.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.updateFootnote(contentState.getParent(block), block)
    return true
  }

  return false
}

export const handleShiftEnter = (contentState, event, block, start) => {
  if (event.shiftKey && block.type === 'span' && block.functionType === 'paragraphContent') {
    let { offset } = start
    const { text, key } = block
    const indent = getIndentSpace(text)
    block.text = text.substring(0, offset) + '\n' + indent + text.substring(offset)

    offset += 1 + indent.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  if (block.type === 'span' && block.functionType === 'codeContent') {
    const { text, key } = block
    const autoIndent = checkAutoIndent(text, start.offset)
    const indent = getIndentSpace(text)
    block.text = text.substring(0, start.offset) +
      '\n' +
      (autoIndent ? indent + ' '.repeat(contentState.tabSize) + '\n' : '') +
      indent +
      text.substring(start.offset)

    let offset = start.offset + 1 + indent.length
    if (autoIndent) {
      offset += contentState.tabSize
    }

    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender()
    return true
  }

  if (event.shiftKey && block.functionType === 'cellContent') {
    const { text, key } = block
    const brTag = '<br/>'
    block.text = text.substring(0, start.offset) + brTag + text.substring(start.offset)
    const offset = start.offset + brTag.length
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.partialRender([block])
    return true
  }

  return false
}

export const handleTableEnter = (contentState, event, block, isOsx, getFirstBlockInNextRow) => {
  if (block.functionType !== 'cellContent') {
    return false
  }

  const row = contentState.closest(block, 'tr')
  const rowContainer = contentState.getBlock(row.parent)
  const table = contentState.closest(rowContainer, 'table')

  if ((isOsx && event.metaKey) || (!isOsx && event.ctrlKey)) {
    const nextRow = contentState.createRow(row, false)
    if (rowContainer.type === 'thead') {
      let tBody = contentState.getBlock(rowContainer.nextSibling)
      if (!tBody) {
        tBody = contentState.createBlock('tbody')
        contentState.appendChild(table, tBody)
      }
      if (tBody.children.length) {
        contentState.insertBefore(nextRow, tBody.children[0])
      } else {
        contentState.appendChild(tBody, nextRow)
      }
    } else {
      contentState.insertAfter(nextRow, row)
    }
    table.row++
  }

  const { key } = getFirstBlockInNextRow(contentState, row)
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  return true
}
