declare module 'snabbdom/vnode' {
  export interface VNode {
    sel?: string
    data?: unknown
    children?: VNode[]
    text?: string
    elm?: Node
    key?: string | number
  }
}
