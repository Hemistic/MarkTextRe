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
import toHTMLModule from 'snabbdom-to-html'

const toHTML = (toHTMLModule as typeof toHTMLModule & { default?: typeof toHTMLModule }).default ?? toHTMLModule

const rawPatch = init([
  classModule,
  attributesModule,
  styleModule,
  propsModule,
  datasetModule,
  eventListenersModule
])

const resolvePatchedElement = (oldNode: any) => {
  if (!oldNode) {
    return null
  }

  return oldNode.elm ?? oldNode
}

const fallbackReplacePatchedNode = (oldNode: any, vnode: any) => {
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

export const patch = (oldNode: any, vnode: any) => {
  try {
    return rawPatch(oldNode, vnode)
  } catch (error: any) {
    if (error && /removeChild|insertBefore/.test(error.message ?? '')) {
      console.warn('[muya] snabbdom patch fallback', error)
      return fallbackReplacePatchedNode(oldNode, vnode)
    }

    throw error
  }
}

export const h = sh
export const toVNode = sToVNode

export { toHTML }

const domNodeToVNode = (node: ChildNode): any => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const element = node as HTMLElement
  const attrs: Record<string, string> = {}

  for (const attr of Array.from(element.attributes)) {
    attrs[attr.name] = attr.value
  }

  const children = Array.from(element.childNodes)
    .map(domNodeToVNode)
    .filter(child => child !== '')

  return h(element.tagName.toLowerCase(), { attrs }, children as any)
}

export const htmlToVNode = (html: string) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  return Array.from(wrapper.childNodes)
    .map(domNodeToVNode)
    .filter(child => child !== '')
}
