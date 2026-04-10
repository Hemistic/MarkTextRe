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

export const patch = init([
  classModule,
  attributesModule,
  styleModule,
  propsModule,
  datasetModule,
  eventListenersModule
])

export const h = sh
export const toVNode = sToVNode

export { toHTML }

export const htmlToVNode = (html: string) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  return toVNode(wrapper).children
}
