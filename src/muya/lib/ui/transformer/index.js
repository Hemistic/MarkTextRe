import './index.css'
import {
  dispatchMuyaRuntimeEvent,
  getMuyaContainer,
  getMuyaContentState,
  getMuyaDocument,
  getMuyaEventCenter
} from '../../muyaRuntimeAccessSupport'

const CIRCLES = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
]

const CIRCLE_RADIO = 6

class Transformer {
  static pluginName = 'transformer'
  constructor (muya, options) {
    this.muya = muya
    this.options = options
    this.reference = null
    this.imageInfo = null
    this.movingAnchor = null
    this.status = false
    this.width = null
    this.eventId = []
    this.lastScrollTop = null
    this.resizing = false
    const doc = this.getOwnerDocument()
    const container = this.container = doc.createElement('div')
    container.classList.add('ag-transformer')
    doc.body.appendChild(container)
    this.listen()
  }

  listen () {
    const eventCenter = getMuyaEventCenter(this.muya)
    const container = getMuyaContainer(this.muya)
    const doc = this.getOwnerDocument()
    if (!eventCenter || !container || !doc || !doc.body) {
      return
    }
    const scrollHandler = event => {
      if (typeof this.lastScrollTop !== 'number') {
        this.lastScrollTop = event.target.scrollTop
        return
      }
      // only when scoll distance great than 50px, then hide the float box.
      if (!this.resizing && this.status && Math.abs(event.target.scrollTop - this.lastScrollTop) > 50) {
        this.hide()
      }
    }
    eventCenter.attachDOMEvent(doc, 'click', this.hide.bind(this))
    eventCenter.subscribe('muya-transformer', ({ reference, imageInfo }) => {
      this.reference = reference
      if (reference) {
        this.imageInfo = imageInfo
        setTimeout(() => {
          this.render()
        })
      } else {
        this.hide()
      }
    })

    eventCenter.attachDOMEvent(container, 'scroll', scrollHandler)
    eventCenter.attachDOMEvent(this.container, 'dragstart', event => event.preventDefault())
    eventCenter.attachDOMEvent(doc.body, 'mousedown', this.mouseDown)
  }

  render () {
    if (this.status) {
      this.hide()
    }
    this.status = true

    this.createElements()
    this.update()
    dispatchMuyaRuntimeEvent(this.muya, 'muya-float', this, true)
  }

  createElements () {
    const doc = this.getOwnerDocument()
    CIRCLES.forEach(c => {
      const circle = doc.createElement('div')
      circle.classList.add('circle')
      circle.classList.add(c)
      circle.setAttribute('data-position', c)
      this.container.appendChild(circle)
    })
  }

  update () {
    const rect = this.reference.getBoundingClientRect()
    CIRCLES.forEach(c => {
      const circle = this.container.querySelector(`.${c}`)

      switch (c) {
        case 'top-left':
          circle.style.left = `${rect.left - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top - CIRCLE_RADIO}px`
          break
        case 'top-right':
          circle.style.left = `${rect.left + rect.width - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top - CIRCLE_RADIO}px`
          break
        case 'bottom-left':
          circle.style.left = `${rect.left - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top + rect.height - CIRCLE_RADIO}px`
          break
        case 'bottom-right':
          circle.style.left = `${rect.left + rect.width - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top + rect.height - CIRCLE_RADIO}px`
          break
      }
    })
  }

  mouseDown = (event) => {
    const target = event.target
    if (!target.closest('.circle')) return
    const eventCenter = getMuyaEventCenter(this.muya)
    const doc = this.getOwnerDocument()
    if (!eventCenter || !doc || !doc.body) {
      return
    }
    this.movingAnchor = target.getAttribute('data-position')
    const mouseMoveId = eventCenter.attachDOMEvent(doc.body, 'mousemove', this.mouseMove)
    const mouseUpId = eventCenter.attachDOMEvent(doc.body, 'mouseup', this.mouseUp)
    this.resizing = true
    // Hide image toolbar
    dispatchMuyaRuntimeEvent(this.muya, 'muya-image-toolbar', { reference: null })
    this.eventId.push(mouseMoveId, mouseUpId)
  }

  mouseMove = (event) => {
    const clientX = event.clientX
    let width
    let relativeAnchor
    const image = this.reference.querySelector('img')
    if (!image) {
      return
    }
    switch (this.movingAnchor) {
      case 'top-left':
      case 'bottom-left':
        relativeAnchor = this.container.querySelector('.top-right')
        width = Math.max(relativeAnchor.getBoundingClientRect().left + CIRCLE_RADIO - clientX, 50)
        break
      case 'top-right':
      case 'bottom-right':
        relativeAnchor = this.container.querySelector('.top-left')
        width = Math.max(clientX - relativeAnchor.getBoundingClientRect().left - CIRCLE_RADIO, 50)
        break
    }
    // Image width/height attribute must be an integer.
    width = parseInt(width)
    this.width = width
    image.setAttribute('width', width)
    this.update()
  }

  mouseUp = (event) => {
    const eventCenter = getMuyaEventCenter(this.muya)
    if (this.eventId.length) {
      for (const id of this.eventId) {
        eventCenter.detachDOMEvent(id)
      }
      this.eventId = []
    }
    // todo update data
    if (typeof this.width === 'number') {
      const contentState = getMuyaContentState(this.muya)
      contentState.updateImage(this.imageInfo, 'width', this.width)
      this.width = null
      this.hide()
    }
    this.resizing = false
    this.movingAnchor = null
  }

  hide () {
    const circles = this.container.querySelectorAll('.circle')
    Array.from(circles).forEach(c => c.remove())
    this.status = false
    dispatchMuyaRuntimeEvent(this.muya, 'muya-float', this, false)
  }

  destroy () {
    this.hide()
    this.container.remove()
  }

  getOwnerDocument () {
    return getMuyaDocument(this.muya)
  }
}

export default Transformer
