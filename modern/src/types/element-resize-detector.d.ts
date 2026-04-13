declare module 'element-resize-detector' {
  interface ElementResizeDetectorInstance {
    listenTo: (element: Element, listener: (element: HTMLElement) => void) => void
    uninstall: (element: Element) => void
  }

  interface ElementResizeDetectorOptions {
    strategy?: 'scroll' | 'object'
  }

  type CreateElementResizeDetector = (
    options?: ElementResizeDetectorOptions
  ) => ElementResizeDetectorInstance

  const createElementResizeDetector: CreateElementResizeDetector

  export default createElementResizeDetector
}

declare module 'element-resize-detector/src/element-resize-detector.js' {
  interface ElementResizeDetectorInstance {
    listenTo: (element: Element, listener: (element: HTMLElement) => void) => void
    uninstall: (element: Element) => void
  }

  interface ElementResizeDetectorOptions {
    strategy?: 'scroll' | 'object'
  }

  type CreateElementResizeDetector = (
    options?: ElementResizeDetectorOptions
  ) => ElementResizeDetectorInstance

  const createElementResizeDetector: CreateElementResizeDetector

  export = createElementResizeDetector
}
