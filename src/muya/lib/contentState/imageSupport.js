import { URL_REG, DATA_URL_REG } from '../config'
import { correctImageSrc } from '../utils/getImageInfo'

const encodeImageSource = src => {
  if (URL_REG.test(src)) {
    return encodeURI(src)
  } else if (DATA_URL_REG.test(src)) {
    return src
  }
  return src.replace(/ /g, encodeURI(' ')).replace(/#/g, encodeURIComponent('#'))
}

const buildHtmlImageTag = attrs => {
  let imageText = '<img '
  for (const attr of Object.keys(attrs)) {
    let value = attrs[attr]
    if (value && attr === 'src') {
      value = correctImageSrc(value)
    }
    imageText += `${attr}="${value}" `
  }
  imageText = imageText.trim()
  imageText += '>'
  return imageText
}

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
  contentState.muya.dispatchChange()
}

export const updateImage = (contentState, { imageId, key, token }, attrName, attrValue) => {
  const block = contentState.getBlock(key)
  const { start, end } = token.range
  const oldText = block.text
  const attrs = Object.assign({}, token.attrs)
  attrs[attrName] = attrValue
  const imageText = buildHtmlImageTag(attrs)
  block.text = oldText.substring(0, start) + imageText + oldText.substring(end)

  contentState.singleRender(block, false)
  const image = document.querySelector(`#${imageId} img`)
  if (image) {
    image.click()
    return contentState.muya.dispatchChange()
  }
}

export const replaceImage = (contentState, { key, token }, { alt = '', src = '', title = '' }) => {
  const { type } = token
  const block = contentState.getBlock(key)
  const { start, end } = token.range
  const oldText = block.text
  let imageText = ''
  if (type === 'image') {
    imageText = '!['
    if (alt) {
      imageText += alt
    }
    imageText += ']('
    if (src) {
      imageText += encodeImageSource(src)
    }
    if (title) {
      imageText += ` "${title}"`
    }
    imageText += ')'
  } else if (type === 'html_tag') {
    const { attrs } = token
    Object.assign(attrs, { alt, src, title })
    imageText = buildHtmlImageTag(attrs)
  }

  block.text = oldText.substring(0, start) + imageText + oldText.substring(end)
  contentState.singleRender(block)
  return contentState.muya.dispatchChange()
}

export const deleteImage = (contentState, { key, token }) => {
  const block = contentState.getBlock(key)
  const oldText = block.text
  const { start, end } = token.range
  const { eventCenter } = contentState.muya
  block.text = oldText.substring(0, start) + oldText.substring(end)

  contentState.cursor = {
    start: { key, offset: start },
    end: { key, offset: start }
  }
  contentState.singleRender(block)
  eventCenter.dispatch('muya-transformer', { reference: null })
  eventCenter.dispatch('muya-image-toolbar', { reference: null })
  return contentState.muya.dispatchChange()
}

export const selectImage = (contentState, imageInfo) => {
  contentState.selectedImage = imageInfo
  const { key } = imageInfo
  const block = contentState.getBlock(key)
  const outMostBlock = contentState.findOutMostBlock(block)
  contentState.cursor = {
    start: { key, offset: imageInfo.token.range.end },
    end: { key, offset: imageInfo.token.range.end }
  }
  const { start } = contentState.prevCursor
  const oldBlock = contentState.findOutMostBlock(contentState.getBlock(start.key))
  if (oldBlock.key !== outMostBlock.key) {
    contentState.singleRender(oldBlock, false)
  }

  return contentState.singleRender(outMostBlock, true)
}
