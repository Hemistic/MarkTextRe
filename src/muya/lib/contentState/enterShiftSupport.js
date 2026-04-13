
import { renderCodeBlockNow } from './inputRenderSupport'

const checkAutoIndent = (text, offset) => {
  const pairStr = text.substring(offset - 1, offset + 1)
  return /^(\{\}|\[\]|\(\)|><)$/.test(pairStr)
}

const getIndentSpace = text => {
  const match = /^(\s*)\S/.exec(text)
  return match ? match[1] : ''
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
    renderCodeBlockNow(contentState, block)
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
