import './index.css'
import { getNodeDocument } from '../../contentState/runtimeDomSupport'
import { getMuyaContainer, getMuyaEventCenter } from '../../muyaRuntimeAccessSupport'

const position = (source, ele) => {
  const rect = source.getBoundingClientRect()
  const { top, right, height } = rect

  Object.assign(ele.style, {
    top: `${top + height + 15}px`,
    left: `${right - ele.offsetWidth / 2 - 10}px`
  })
}

class Tooltip {
  constructor (muya) {
    this.muya = muya
    this.cache = new WeakMap()
    this.activeTooltips = new Set()
    const container = getMuyaContainer(this.muya)
    const eventCenter = getMuyaEventCenter(this.muya)

    if (container && eventCenter) {
      eventCenter.attachDOMEvent(container, 'mouseover', this.mouseOver.bind(this))
    }
  }

  mouseOver (event) {
    const { target } = event
    const toolTipTarget = target.closest('[data-tooltip]')
    const eventCenter = getMuyaEventCenter(this.muya)
    if (toolTipTarget && !this.cache.has(toolTipTarget)) {
      const tooltip = toolTipTarget.getAttribute('data-tooltip')
      const doc = getNodeDocument(toolTipTarget)
      if (!doc || !doc.body) {
        return
      }
      const tooltipEle = doc.createElement('div')
      tooltipEle.textContent = tooltip
      tooltipEle.classList.add('ag-tooltip')
      doc.body.appendChild(tooltipEle)
      position(toolTipTarget, tooltipEle)

      this.cache.set(toolTipTarget, tooltipEle)
      this.activeTooltips.add(tooltipEle)

      setTimeout(() => {
        tooltipEle.classList.add('active')
      })

      const timer = setInterval(() => {
        if (!doc.body.contains(toolTipTarget)) {
          this.mouseLeave({ target: toolTipTarget })
          clearInterval(timer)
        }
      }, 300)

      eventCenter && eventCenter.attachDOMEvent(toolTipTarget, 'mouseleave', this.mouseLeave.bind(this))
    }
  }

  mouseLeave (event) {
    const { target } = event
    if (this.cache.has(target)) {
      const tooltipEle = this.cache.get(target)
      tooltipEle.remove()
      this.activeTooltips.delete(tooltipEle)
      this.cache.delete(target)
    }
  }

  destroy () {
    for (const tooltip of this.activeTooltips) {
      tooltip.remove()
    }
    this.activeTooltips.clear()
  }
}

export default Tooltip
