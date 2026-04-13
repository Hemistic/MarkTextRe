let prismModulePromise = null
let prismModuleCache = null
let prismSearchPromise = null

const loadPrismRuntimeModule = async () => {
  if (prismModuleCache) {
    return prismModuleCache
  }

  if (!prismModulePromise) {
    prismModulePromise = import('./runtime').then(module => {
      prismModuleCache = module
      return module
    })
  }

  return prismModulePromise
}

const loadPrismSearchModule = async () => {
  if (!prismSearchPromise) {
    prismSearchPromise = import('./searchSupport')
  }

  return prismSearchPromise
}

export const getCachedPrismModule = () => prismModuleCache

export const ensurePrismModule = async () => loadPrismRuntimeModule()

export const ensureLanguageLoaded = async lang => {
  const { loadLanguage } = await loadPrismRuntimeModule()
  return loadLanguage(lang)
}

export const searchLanguages = async text => {
  const { search } = await loadPrismSearchModule()
  return search(text)
}
