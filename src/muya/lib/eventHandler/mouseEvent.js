import { getLinkInfo } from '../utils/getLinkInfo'
import { collectFootnotes } from '../utils'
import {
  getMuyaContainer,
  getMuyaContentState,
  getMuyaEventCenter,
  getMuyaOptions
} from '../muyaRuntimeAccessSupport'

class MouseEvent {
  constructor (muya) {
    this.muya = muya
    this.mouseBinding()
    this.mouseDown()
  }

  mouseBinding () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    if (!container || !eventCenter || !contentState) {
      return
    }
    const handler = event => {
      const target = event.target
      const parent = target.parentNode
      const preSibling = target.previousElementSibling
      const parentPreSibling = parent ? parent.previousElementSibling : null
      const { hideLinkPopup, footnote } = getMuyaOptions(this.muya)
      const rect = parent.getBoundingClientRect()
      const reference = {
        getBoundingClientRect () {
          return rect
        }
      }

      if (
        !hideLinkPopup &&
        parent &&
        parent.tagName === 'A' &&
        parent.classList.contains('ag-inline-rule') &&
        parentPreSibling &&
        parentPreSibling.classList.contains('ag-hide')
      ) {
        eventCenter.dispatch('muya-link-tools', {
          reference,
          linkInfo: getLinkInfo(parent)
        })
      }

      if (
        footnote &&
        parent &&
        parent.tagName === 'SUP' &&
        parent.classList.contains('ag-inline-footnote-identifier') &&
        preSibling &&
        preSibling.classList.contains('ag-hide')
      ) {
        const identifier = target.textContent
        eventCenter.dispatch('muya-footnote-tool', {
          reference,
          identifier,
          footnotes: collectFootnotes(contentState.blocks)
        })
      }
    }
    const leaveHandler = event => {
      const target = event.target
      const parent = target.parentNode
      const preSibling = target.previousElementSibling
      const { footnote } = getMuyaOptions(this.muya)
      if (parent && parent.tagName === 'A' && parent.classList.contains('ag-inline-rule')) {
        eventCenter.dispatch('muya-link-tools', {
          reference: null
        })
      }

      if (
        footnote &&
        parent &&
        parent.tagName === 'SUP' &&
        parent.classList.contains('ag-inline-footnote-identifier') &&
        preSibling &&
        preSibling.classList.contains('ag-hide')
      ) {
        eventCenter.dispatch('muya-footnote-tool', {
          reference: null
        })
      }
    }

    eventCenter.attachDOMEvent(container, 'mouseover', handler)
    eventCenter.attachDOMEvent(container, 'mouseout', leaveHandler)
  }

  mouseDown () {
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)
    const contentState = getMuyaContentState(this.muya)
    if (!container || !eventCenter || !contentState) {
      return
    }
    const handler = event => {
      const target = event.target
      if (target.classList && target.classList.contains('ag-drag-handler')) {
        contentState.handleMouseDown(event)
      } else if (target && target.closest('tr')) {
        contentState.handleCellMouseDown(event)
      }
    }
    eventCenter.attachDOMEvent(container, 'mousedown', handler)
  }
}

export default MouseEvent
