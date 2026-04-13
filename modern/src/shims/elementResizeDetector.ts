import * as elementResizeDetectorModule from 'element-resize-detector/src/element-resize-detector.js'

const elementResizeDetector = (
  elementResizeDetectorModule as typeof elementResizeDetectorModule & {
    default?: unknown
  }
).default ?? elementResizeDetectorModule

export default elementResizeDetector
