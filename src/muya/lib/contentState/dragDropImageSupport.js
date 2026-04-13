import {
  getUniqueId,
  getImageInfo as getImageSrc,
  checkImageContentType
} from '../utils'
import { getImageInfo } from '../utils/getImageInfo'
import { URL_REG, IMAGE_EXT_REG } from '../config'
import { getContentStateUrlMap } from './runtimeRenderAccessSupport'
import { dispatchContentStateStateChange } from './runtimeEventSupport'
import { getContentStateOptions } from './runtimeOptionSupport'
import { queryContentState } from './runtimeDomSupport'

const moveDropBlockToAnchor = (contentState, imageBlock, dropAnchor) => {
  const { anchor, position } = dropAnchor
  if (position === 'up') {
    contentState.insertBefore(imageBlock, anchor)
  } else {
    contentState.insertAfter(imageBlock, anchor)
  }
}

export const handleUriListDrop = (contentState, item, dropAnchor) => {
  item.getAsString(async str => {
    if (!(URL_REG.test(str) && dropAnchor)) {
      return
    }

    let isImage = false
    if (IMAGE_EXT_REG.test(str)) {
      isImage = true
    }
    if (!isImage) {
      isImage = await checkImageContentType(str)
    }
    if (!isImage) return

    const text = `![](${str})`
    const imageBlock = contentState.createBlockP(text)
    const { anchor, position } = dropAnchor

    if (position === 'up') {
      contentState.insertBefore(imageBlock, anchor)
    } else {
      contentState.insertAfter(imageBlock, anchor)
    }

    const key = imageBlock.children[0].key
    const offset = 0
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.render()
    dispatchContentStateStateChange(contentState)
  })
}

export const handleImageFileDrop = async (contentState, image, dropAnchor) => {
  const { name, path } = image
  const id = `loading-${getUniqueId()}`
  const text = `![${id}](${path})`
  const imageBlock = contentState.createBlockP(text)

  moveDropBlockToAnchor(contentState, imageBlock, dropAnchor)

  const key = imageBlock.children[0].key
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.render()

  try {
    const { imageAction } = getContentStateOptions(contentState)
    const newSrc = await imageAction(path, id, name)
    const { src } = getImageSrc(path)
    if (src) {
      const urlMap = getContentStateUrlMap(contentState)
      urlMap && urlMap.set(newSrc, src)
    }
    const imageWrapper = queryContentState(contentState, `span[data-id=${id}]`)

    if (imageWrapper) {
      const imageInfo = getImageInfo(imageWrapper)
      contentState.replaceImage(imageInfo, {
        alt: name,
        src: newSrc
      })
    }
  } catch (error) {
    // TODO: Notify user about an error.
    console.error('Unexpected error on image action:', error)
  }

  dispatchContentStateStateChange(contentState)
}
