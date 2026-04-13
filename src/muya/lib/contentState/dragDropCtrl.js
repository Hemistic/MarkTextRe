import {
  createGhost,
  dragleaveHandler,
  dragoverHandler,
  dropHandler,
  hideGhost
} from './dragDropSupport'

const dragDropCtrl = ContentState => {
  ContentState.prototype.hideGhost = function () {
    return hideGhost(this)
  }
  /**
   * create the ghost element.
   */
  ContentState.prototype.createGhost = function (event) {
    return createGhost(this, event)
  }

  ContentState.prototype.dragoverHandler = function (event) {
    return dragoverHandler(this, event)
  }

  ContentState.prototype.dragleaveHandler = function (event) {
    return dragleaveHandler(this, event)
  }

  ContentState.prototype.dropHandler = async function (event) {
    return dropHandler(this, event)
  }
}

export default dragDropCtrl
