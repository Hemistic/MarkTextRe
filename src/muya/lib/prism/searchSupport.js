import { filter } from 'fuzzaldrin'
import { languages } from 'prismjs/components.js'

const langs = []

for (const name of Object.keys(languages)) {
  const lang = languages[name]
  langs.push({
    name,
    ...lang
  })
  if (lang.alias) {
    if (typeof lang.alias === 'string') {
      langs.push({
        name: lang.alias,
        ...lang
      })
    } else if (Array.isArray(lang.alias)) {
      langs.push(...lang.alias.map(alias => ({
        name: alias,
        ...lang
      })))
    }
  }
}

export const search = text => {
  return filter(langs, text, { key: 'name' })
}
