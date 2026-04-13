import snapSvgUrl from 'legacy-muya/lib/assets/libs/snap.svg-min.js?url'
import vegaUrl from '../../../node_modules/vega/build/vega.min.js?url'
import vegaLiteUrl from '../../../node_modules/vega-lite/build/vega-lite.min.js?url'
import vegaEmbedUrl from '../../../node_modules/vega-embed/build/vega-embed.min.js?url'

type LegacyWindow = Window & typeof globalThis & {
  Snap?: unknown
  vega?: unknown
  vegaLite?: unknown
  vegaEmbed?: unknown
  __marktextSnapReady__?: Promise<void>
  __marktextVegaReady__?: Promise<void>
}

const globalScope = window as LegacyWindow
const loadClassicScript = (src: string) => new Promise<void>((resolve, reject) => {
  const existingScript = document.querySelector(`script[data-marktext-legacy-src="${src}"]`) as HTMLScriptElement | null
  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') {
      resolve()
      return
    }

    existingScript.addEventListener('load', () => resolve(), { once: true })
    existingScript.addEventListener('error', () => reject(new Error(`Failed to load legacy script: ${src}`)), { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = src
  script.async = false
  script.dataset.marktextLegacySrc = src
  script.addEventListener('load', () => {
    script.dataset.loaded = 'true'
    resolve()
  }, { once: true })
  script.addEventListener('error', () => reject(new Error(`Failed to load legacy script: ${src}`)), { once: true })
  document.head.appendChild(script)
})

export const ensureLegacyDiagramGlobals = async () => {
  if (globalScope.Snap) {
    return
  }

  if (!globalScope.__marktextSnapReady__) {
    globalScope.__marktextSnapReady__ = loadClassicScript(snapSvgUrl)
  }

  await globalScope.__marktextSnapReady__
}

export const ensureLegacyVegaGlobals = async () => {
  if (globalScope.vegaEmbed) {
    return globalScope.vegaEmbed
  }

  if (!globalScope.__marktextVegaReady__) {
    globalScope.__marktextVegaReady__ = (async () => {
      await loadClassicScript(vegaUrl)
      await loadClassicScript(vegaLiteUrl)
      await loadClassicScript(vegaEmbedUrl)
    })()
  }

  await globalScope.__marktextVegaReady__

  if (!globalScope.vegaEmbed) {
    throw new Error('Failed to initialize legacy Vega renderer globals.')
  }

  return globalScope.vegaEmbed
}
