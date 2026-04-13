import { normalizeRendererModule } from './rendererModuleSupport'

export const createRendererLoaders = () => ({
  katex: () => import('../parser/render/katex'),
  sequence: () => import('../parser/render/sequence'),
  plantuml: () => import('../parser/render/plantuml'),
  flowchart: () => import('flowchart.js'),
  mermaid: () => import('mermaid'),
  'vega-lite': () => import('vega-embed')
})

export const loadRendererModule = async (name, loader) => {
  const module = await loader()
  return normalizeRendererModule(name, module)
}
