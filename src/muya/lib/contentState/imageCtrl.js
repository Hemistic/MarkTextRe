import {
  insertImage,
  updateImage,
  replaceImage,
  deleteImage,
  selectImage
} from './imageSupport'

const imageCtrl = ContentState => {
  /**
   * insert inline image at the cursor position.
   */
  ContentState.prototype.insertImage = function ({ alt = '', src = '', title = '' }) {
    return insertImage(this, { alt, src, title })
  }

  ContentState.prototype.updateImage = function ({ imageId, key, token }, attrName, attrValue) { // inline/left/center/right
    return updateImage(this, { imageId, key, token }, attrName, attrValue)
  }

  ContentState.prototype.replaceImage = function ({ key, token }, { alt = '', src = '', title = '' }) {
    return replaceImage(this, { key, token }, { alt, src, title })
  }

  ContentState.prototype.deleteImage = function ({ key, token }) {
    return deleteImage(this, { key, token })
  }

  ContentState.prototype.selectImage = function (imageInfo) {
    return selectImage(this, imageInfo)
  }
}

export default imageCtrl
