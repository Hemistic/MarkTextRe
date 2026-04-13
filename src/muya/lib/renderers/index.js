import { createRendererLoaders, loadRendererModule } from './rendererLoadSupport'

const rendererCache = new Map()
const rendererLoaders = createRendererLoaders()
/**
 *
 * @param {string} name the renderer name: katex, sequence, plantuml, flowchart, mermaid, vega-lite
 */
const loadRenderer = async (name) => {
  if (!rendererCache.has(name)) {
    const loader = rendererLoaders[name]

    if (!loader) {
      throw new Error(`Unknown renderer name ${name}`)
    }

    const renderer = await loadRendererModule(name, loader)
    rendererCache.set(name, renderer)
  }

  return rendererCache.get(name)
}

export default loadRenderer
