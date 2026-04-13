import { encodeImageSource } from './imageMarkupSupport'
import { dispatchContentStateChange } from './runtimeEventSupport'

export const insertImage = (contentState, { alt = '', src = '', title = '' }) => {
  const match = /(?:\/|\\)?([^./\\]+)\.[a-z]+$/.exec(src)
  if (!alt) {
    alt = match && match[1] ? match[1] : ''
  }

  const { start, end } = contentState.cursor
  const { formats } = contentState.selectionFormats({ start, end })
  const { key, offset: startOffset } = start
  const { offset: endOffset } = end
  const block = contentState.getBlock(key)
  if (
    block.type === 'span' &&
    (
      block.functionType === 'codeContent' ||
      block.functionType === 'languageInput' ||
      block.functionType === 'thematicBreakLine'
    )
  ) {
    return
  }

  const { text } = block
  const imageFormat = formats.filter(format => format.type === 'image')
  let srcAndTitle = encodeImageSource(src)
  if (srcAndTitle && title) {
    srcAndTitle += ` "${title}"`
  }

  if (
    imageFormat.length === 1 &&
    imageFormat[0].range.start !== startOffset &&
    imageFormat[0].range.end !== endOffset
  ) {
    let imageAlt = alt
    if (imageFormat[0].alt && !imageFormat[0].src) {
      imageAlt = imageFormat[0].alt
    }

    const { start, end } = imageFormat[0].range
    block.text = text.substring(0, start) +
      `![${imageAlt}](${srcAndTitle})` +
      text.substring(end)

    contentState.cursor = {
      start: { key, offset: start + 2 },
      end: { key, offset: start + 2 + imageAlt.length }
    }
  } else if (key !== end.key) {
    const endBlock = contentState.getBlock(end.key)
    const { text } = endBlock
    endBlock.text = text.substring(0, endOffset) + `![${alt}](${srcAndTitle})` + text.substring(endOffset)
    const offset = endOffset + 2
    contentState.cursor = {
      start: { key: end.key, offset },
      end: { key: end.key, offset: offset + alt.length }
    }
  } else {
    const imageAlt = startOffset !== endOffset ? text.substring(startOffset, endOffset) : alt
    block.text = text.substring(0, start.offset) +
      `![${imageAlt}](${srcAndTitle})` +
      text.substring(end.offset)

    contentState.cursor = {
      start: {
        key,
        offset: startOffset + 2
      },
      end: {
        key,
        offset: startOffset + 2 + imageAlt.length
      }
    }
  }
  contentState.partialRender()
  dispatchContentStateChange(contentState)
}
