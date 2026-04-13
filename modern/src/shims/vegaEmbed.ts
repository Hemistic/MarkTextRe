import { ensureLegacyVegaGlobals } from '../renderer/services/legacyScripts'

type VegaEmbed = (element: Element | string, spec: unknown, options?: Record<string, unknown>) => Promise<unknown>

const embed: VegaEmbed = async (element, spec, options) => {
  const renderer = await ensureLegacyVegaGlobals() as VegaEmbed
  return renderer(element, spec, options)
}

export default embed
