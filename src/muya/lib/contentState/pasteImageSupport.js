import { IMAGE_EXT_REG } from '../config'
import { pasteImageFromFile } from './pasteImageFileSupport'
import { pasteImageFromPath } from './pasteImagePathSupport'
import { getContentStateOption } from './runtimeOptionSupport'

export const pasteImage = async (contentState, event) => {
  const clipboardFilePath = getContentStateOption(contentState, 'clipboardFilePath')
  const imagePath = typeof clipboardFilePath === 'function'
    ? clipboardFilePath()
    : null
  if (imagePath && typeof imagePath === 'string' && IMAGE_EXT_REG.test(imagePath)) {
    return pasteImageFromPath(contentState, imagePath)
  }

  const items = event.clipboardData && event.clipboardData.items
  let file = null
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        file = items[i].getAsFile()
        break
      }
    }
  }

  if (file) {
    return pasteImageFromFile(contentState, file)
  }

  return null
}
