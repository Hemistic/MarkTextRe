import { buildHtmlImageTag, encodeImageSource } from './imageMarkupSupport'
import { queryContentState } from './runtimeDomSupport'
import {
  dispatchContentStateChange,
  dispatchContentStateEvent
} from './runtimeEventSupport'

export const updateImage = (contentState, { imageId, key, token }, attrName, attrValue) => {
  const block = contentState.getBlock(key)
  const { start, end } = token.range
  const oldText = block.text
  const attrs = Object.assign({}, token.attrs)
  attrs[attrName] = attrValue
  const imageText = buildHtmlImageTag(attrs)
  block.text = oldText.substring(0, start) + imageText + oldText.substring(end)

  contentState.singleRender(block, false)
  const image = queryContentState(contentState, `#${imageId} img`)
  if (image) {
    image.click()
    return dispatchContentStateChange(contentState)
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
  return dispatchContentStateChange(contentState)
}

export const deleteImage = (contentState, { key, token }) => {
  const block = contentState.getBlock(key)
  const oldText = block.text
  const { start, end } = token.range
  block.text = oldText.substring(0, start) + oldText.substring(end)

  contentState.cursor = {
    start: { key, offset: start },
    end: { key, offset: start }
  }
  contentState.singleRender(block)
  dispatchContentStateEvent(contentState, 'muya-transformer', { reference: null })
  dispatchContentStateEvent(contentState, 'muya-image-toolbar', { reference: null })
  return dispatchContentStateChange(contentState)
}
