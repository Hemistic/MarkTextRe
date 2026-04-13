import selection from '../selection'
import { getImageInfo } from '../utils/getImageInfo'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const maybeOpenImageSelector = contentState => {
  requestAnimationFrame(() => {
    const startNode = selection.getSelectionStart()
    if (startNode) {
      const imageWrapper = startNode.closest('.ag-inline-image')
      if (imageWrapper && imageWrapper.classList.contains('ag-empty-image')) {
        const imageInfo = getImageInfo(imageWrapper)
        dispatchContentStateEvent(contentState, 'muya-image-selector', {
          reference: imageWrapper,
          imageInfo,
          cb: () => {}
        })
      }
    }
  })
}
