const LINE_BREAKS_REG = /\n/

export const appendHtmlAtCursor = (contentState, startBlock, start, text) => {
  startBlock.text = startBlock.text.substring(0, start.offset) + text + startBlock.text.substring(start.offset)
  const { key } = start
  const offset = start.offset + text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}

export const handleCopyAsHtmlPaste = (contentState, type, text, startBlock, parent, appendHtml) => {
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
