import { getImageInfo } from '../utils/getImageInfo'
import { queryContentState } from './runtimeDomSupport'

export const replacePendingImage = (contentState, alt, src) => {
  if (contentState.selectedImage) {
    contentState.replaceImage(contentState.selectedImage, { alt, src })
  } else {
    contentState.insertImage({ alt, src })
  }
}

export const applyResolvedImage = (contentState, id, src) => {
  const imageWrapper = queryContentState(contentState, `span[data-id=${id}]`)
  if (imageWrapper) {
    const imageInfo = getImageInfo(imageWrapper)
    contentState.replaceImage(imageInfo, { src })
  }
}
