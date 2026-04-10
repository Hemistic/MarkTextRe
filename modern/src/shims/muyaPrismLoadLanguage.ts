import components from 'prismjs/components.js'
import getLoader from 'prismjs/dependencies'

type PrismLike = {
  languages: Record<string, unknown>
}

type LanguageLoadStatus = {
  lang: string
  status: 'cached' | 'loaded' | 'noexist'
}

const componentImports = import.meta.glob('../../node_modules/prismjs/components/prism-*.js')
const prismComponentLoaders = new Map(
  Object.entries(componentImports).map(([file, load]) => {
    const match = /prism-(.+)\.js$/.exec(file)
    return [match?.[1] ?? '', load]
  })
)

/**
 * Languages already bundled in the base Prism build.
 */
export const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript'])

const { languages } = components

// Look for the origin language by alias.
export const transformAliasToOrigin = (langs: string[]) => {
  const result: string[] = []

  for (const lang of langs) {
    if (languages[lang]) {
      result.push(lang)
      continue
    }

    const language = Object.keys(languages).find(name => {
      const languageMeta = languages[name]
      if (languageMeta.alias) {
        return languageMeta.alias === lang || (Array.isArray(languageMeta.alias) && languageMeta.alias.includes(lang))
      }
      return false
    })

    result.push(language ?? lang)
  }

  return result
}

function initLoadLanguage (Prism: PrismLike) {
  return async function loadLanguages (langs?: string | string[]) {
    if (!langs) {
      langs = Object.keys(languages).filter(lang => lang !== 'meta')
    }

    if (langs && !langs.length) {
      return Promise.reject(new Error('The first parameter should be a list of load languages or single language.'))
    }

    if (!Array.isArray(langs)) {
      langs = [langs]
    }

    const promises: Promise<LanguageLoadStatus>[] = []
    const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)]

    getLoader(components, langs, loaded).load((lang: string) => {
      promises.push((async () => {
        if (!(lang in components.languages)) {
          return {
            lang,
            status: 'noexist'
          } satisfies LanguageLoadStatus
        }

        if (loadedLanguages.has(lang)) {
          return {
            lang,
            status: 'cached'
          } satisfies LanguageLoadStatus
        }

        delete Prism.languages[lang]

        const load = prismComponentLoaders.get(lang)
        if (!load) {
          return {
            lang,
            status: 'noexist'
          } satisfies LanguageLoadStatus
        }

        await load()
        loadedLanguages.add(lang)

        return {
          lang,
          status: 'loaded'
        } satisfies LanguageLoadStatus
      })())
    })

    return Promise.all(promises)
  }
}

export default initLoadLanguage
