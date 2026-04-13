import { getUniqueId } from '../utils'
import { applyResolvedImage, replacePendingImage } from './pasteImageMutationSupport'
import { getContentStateUrlMap } from './runtimeRenderAccessSupport'
import { getContentStateDocument, queryContentState } from './runtimeDomSupport'
import { getContentStateOptions } from './runtimeOptionSupport'

export const pasteImageFromFile = async (contentState, file) => {
  const id = `loading-${getUniqueId()}`
  replacePendingImage(contentState, id, '')
  const doc = getContentStateDocument(contentState)

  const reader = new FileReader()
  reader.onload = event => {
    const base64 = event.target.result
    const imageWrapper = queryContentState(contentState, `span[data-id=${id}]`)
    const imageContainer = queryContentState(contentState, `span[data-id=${id}] .ag-image-container`)
    const urlMap = getContentStateUrlMap(contentState)
    urlMap && urlMap.set(id, base64)
    if (imageWrapper && imageContainer && doc) {
      imageWrapper.classList.remove('ag-empty-image')
      imageWrapper.classList.add('ag-image-success')
      const image = doc.createElement('img')
      image.src = base64
      imageContainer.appendChild(image)
    }
  }
  reader.readAsDataURL(file)

  let newSrc = null
  try {
    const { imageAction } = getContentStateOptions(contentState)
    newSrc = await imageAction(file, id)
  } catch (error) {
    console.error('Unexpected error on image action:', error)
    return null
  }

  const urlMap = getContentStateUrlMap(contentState)
  const base64 = urlMap && urlMap.get(id)
  if (base64) {
    urlMap.set(newSrc, base64)
    urlMap.delete(id)
  }

  applyResolvedImage(contentState, id, newSrc)
  return file
}
