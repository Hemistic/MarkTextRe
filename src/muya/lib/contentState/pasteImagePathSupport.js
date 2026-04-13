import { getUniqueId, getImageInfo as getImageSrc } from '../utils'
import { applyResolvedImage, replacePendingImage } from './pasteImageMutationSupport'
import { getContentStateUrlMap } from './runtimeRenderAccessSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const pasteImageFromPath = async (contentState, imagePath) => {
  const id = `loading-${getUniqueId()}`
  replacePendingImage(contentState, id, imagePath)

  let newSrc = null
  try {
    const { imageAction } = getContentStateOptions(contentState)
    newSrc = await imageAction(imagePath, id)
  } catch (error) {
    console.error('Unexpected error on image action:', error)
    return null
  }

  const { src } = getImageSrc(imagePath)
  if (src) {
    const urlMap = getContentStateUrlMap(contentState)
    urlMap && urlMap.set(newSrc, src)
  }

  applyResolvedImage(contentState, id, newSrc)
  return imagePath
}
