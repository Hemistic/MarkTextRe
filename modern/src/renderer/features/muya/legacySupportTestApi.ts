// @ts-expect-error legacy Muya support module is authored in JS.
import * as domQuerySupport from '../../../../../src/muya/lib/utils/domQuerySupport.js'
// @ts-expect-error legacy Muya support module is authored in JS.
import * as renderPipelineStateSupport from '../../../../../src/muya/lib/contentState/renderPipelineStateSupport.js'

export const {
  matchesSelector,
  queryFromRoot,
  resolveConnectedNode
} = domQuerySupport as Record<string, any>

export const {
  canRenderRange,
  createEmptySearchMatches,
  getRenderState,
  prepareRenderContext,
  resolveRenderIndices
} = renderPipelineStateSupport as Record<string, any>
