import { queryContentState } from './runtimeDomSupport'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleDocEnter = (contentState, event) => {
  const { selectedImage } = contentState
  if (!selectedImage) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  const { imageId, ...imageInfo } = selectedImage
  const imageWrapper = queryContentState(contentState, `#${imageId}`)
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

  dispatchContentStateEvent(contentState, 'muya-image-selector', {
    reference,
    imageInfo,
    cb: () => {}
  })
  contentState.selectedImage = null

  return true
}
