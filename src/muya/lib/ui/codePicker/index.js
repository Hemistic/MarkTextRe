import BaseScrollFloat from '../baseScrollFloat'
import { patch, h } from '../../parser/render/snabbdom'
import { searchLanguages } from '../../prism/runtimeSupport'
import fileIcons from '../fileIcons'
import { getMuyaEventCenter } from '../../muyaRuntimeAccessSupport'

import './index.css'

const defaultOptions = {
  placement: 'bottom-start',
  modifiers: {
    offset: {
      offset: '0, 0'
    }
  },
  showArrow: false
}

class CodePicker extends BaseScrollFloat {
  static pluginName = 'codePicker'

  constructor (muya, options = {}) {
    const name = 'ag-list-picker'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.renderArray = []
    this.oldVnode = null
    this.activeItem = null
    this.searchRequestId = 0
    this.listen()
  }

  listen () {
    super.listen()
    const eventCenter = getMuyaEventCenter(this.muya)
    eventCenter && eventCenter.subscribe('muya-code-picker', ({ reference, lang, cb }) => {
      if (!reference) {
        this.hide()
        return
      }

      const requestId = ++this.searchRequestId
      searchLanguages(lang)
        .then(modes => {
          if (requestId !== this.searchRequestId) return

          if (modes.length) {
            this.show(reference, cb)
            this.renderArray = modes
            this.activeItem = modes[0]
            this.render()
          } else {
            this.hide()
          }
        })
        .catch(err => {
          console.warn(err)
          if (requestId === this.searchRequestId) {
            this.hide()
          }
        })
    })
  }

  render () {
    const { renderArray, oldVnode, scrollElement, activeItem } = this
    let children = renderArray.map(item => {
      let iconClassNames

      if (item.name) {
        iconClassNames = fileIcons.getClassByLanguage(item.name)
      }

      // Because `markdown mode in Codemirror` don't have extensions.
      // if still can not get the className, add a common className 'atom-icon light-cyan'
      if (!iconClassNames) {
        iconClassNames = item.name === 'markdown' ? fileIcons.getClassByName('fackname.md') : 'atom-icon light-cyan'
      }
      const iconSelector = 'span' + iconClassNames.split(/\s/).map(s => `.${s}`).join('')
      const icon = h('div.icon-wrapper', h(iconSelector))
      const text = h('div.language', item.name)
      const selector = activeItem === item ? 'li.item.active' : 'li.item'
      return h(selector, {
        dataset: {
          label: item.name
        },
        on: {
          click: () => {
            this.selectItem(item)
          }
        }
      }, [icon, text])
    })

    if (children.length === 0) {
      children = h('div.no-result', 'No result')
    }
    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  getItemElement (item) {
    const { name } = item
    return this.floatBox.querySelector(`[data-label="${name}"]`)
  }
}

export default CodePicker
