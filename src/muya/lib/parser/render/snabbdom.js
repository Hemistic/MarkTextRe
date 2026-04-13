import {
  init,
  classModule,
  attributesModule,
  datasetModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h as sh,
  toVNode as sToVNode
} from 'snabbdom'

const rawPatch = init([
  classModule,
  attributesModule,
  styleModule,
  propsModule,
  datasetModule,
  eventListenersModule
])

export const h = sh
export const toVNode = sToVNode

export const toHTML = require('snabbdom-to-html') // helper function for convert vnode to HTML string

const resolvePatchedElement = oldNode => {
  if (!oldNode) {
    return null
  }

  return oldNode.elm || oldNode
}

const fallbackReplacePatchedNode = (oldNode, vnode) => {
  const target = resolvePatchedElement(oldNode)
  if (!target || !target.parentNode) {
    return vnode
  }

  const template = document.createElement('template')
  template.innerHTML = toHTML(vnode)
  const nextNode = template.content.firstChild

  if (!nextNode) {
    return vnode
  }

  target.parentNode.replaceChild(nextNode, target)
  vnode.elm = nextNode

  return vnode
}

export const safePatch = (oldNode, vnode) => {
  try {
    return rawPatch(oldNode, vnode)
  } catch (error) {
    if (error && /removeChild|insertBefore/.test(error.message || '')) {
      console.warn('[muya] snabbdom patch fallback', error)
      return fallbackReplacePatchedNode(oldNode, vnode)
    }

    throw error
  }
}

export { safePatch as patch }

export const htmlToVNode = html => { // helper function for convert html to vnode
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  return toVNode(wrapper).children
}
