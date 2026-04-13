import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter,
  getMuyaWindow
} from '../muyaRuntimeAccessSupport'

class DragDrop {
  constructor (muya) {
    this.muya = muya
    this.dragOverBinding()
    this.dropBinding()
    this.dragendBinding()
    this.dragStartBinding()
  }

  dragStartBinding () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    if (!container || !eventCenter) {
      return
    }

    const dragStartHandler = event => {
      if (event.target.tagName === 'IMG') {
        return event.preventDefault()
      }
    }

    eventCenter.attachDOMEvent(container, 'dragstart', dragStartHandler)
  }

  dragOverBinding () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    if (!container || !eventCenter || !contentState) {
      return
    }

    const dragoverHandler = event => {
      contentState.dragoverHandler(event)
    }

    eventCenter.attachDOMEvent(container, 'dragover', dragoverHandler)
  }

  dropBinding () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    if (!container || !eventCenter || !contentState) {
      return
    }

    const dropHandler = event => {
      contentState.dropHandler(event)
    }

    eventCenter.attachDOMEvent(container, 'drop', dropHandler)
  }

  dragendBinding () {
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    const runtimeWindow = getMuyaWindow(this.muya)
    if (!eventCenter || !contentState || !runtimeWindow) {
      return
    }

    const dragleaveHandler = event => {
      contentState.dragleaveHandler(event)
    }

    eventCenter.attachDOMEvent(runtimeWindow, 'dragleave', dragleaveHandler)
  }
}

export default DragDrop
