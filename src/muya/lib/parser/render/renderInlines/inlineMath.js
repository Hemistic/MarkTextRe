import { CLASS_OR_ID } from '../../../config'
import { htmlToVNode } from '../snabbdom'

export default function displayMath (h, cursor, block, token, outerClass) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const mathSelector = className === CLASS_OR_ID.AG_HIDE
    ? `span.${className}.${CLASS_OR_ID.AG_MATH}`
    : `span.${CLASS_OR_ID.AG_MATH}`

  const { start, end } = token.range
  const { marker } = token

  const startMarker = this.highlight(h, block, start, start + marker.length, token)
  const endMarker = this.highlight(h, block, end - marker.length, end, token)
  const content = this.highlight(h, block, start + marker.length, end - marker.length, token)

  const { content: math, type } = token

  const { loadMathMap } = this

  const displayMode = false
  const key = `${math}_${type}`
  const targetId = `ag-math-render-${block.key}-${start}-${end}`
  const targetSelector = `#${targetId}`
  let mathVnode = null
  let previewSelector = `span.${CLASS_OR_ID.AG_MATH_RENDER}`
  const mathState = loadMathMap.get(key)
  if (mathState && mathState.status === 'ready') {
    mathVnode = htmlToVNode(mathState.html)
  } else if (mathState && mathState.status === 'error') {
    mathVnode = '< Invalid Mathematical Formula >'
    previewSelector += `.${CLASS_OR_ID.AG_MATH_ERROR}`
  } else {
    mathVnode = math
    this.pendingPreviewRenders.set(targetSelector, {
      functionType: 'inline-math',
      cacheKey: key,
      code: math,
      displayMode
    })
  }

  return [
    h(`span.${className}.${CLASS_OR_ID.AG_MATH_MARKER}`, startMarker),
    h(mathSelector, [
      h(`span.${CLASS_OR_ID.AG_INLINE_RULE}.${CLASS_OR_ID.AG_MATH_TEXT}`, {
        attrs: { spellcheck: 'false' }
      }, content),
      h(previewSelector, {
        attrs: {
          id: targetId,
          contenteditable: 'false'
        }
      }, mathVnode)
    ]),
    h(`span.${className}.${CLASS_OR_ID.AG_MATH_MARKER}`, endMarker)
  ]
}
