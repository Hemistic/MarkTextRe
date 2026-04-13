import Prism from 'prismjs'
import initLoadLanguage, { loadedLanguages, transformAliasToOrigin } from './loadLanguage'

const prism = Prism
window.Prism = Prism
/* eslint-disable */
import('prismjs/plugins/keep-markup/prism-keep-markup')
/* eslint-enable */

const loadLanguage = initLoadLanguage(Prism)

// pre load latex and yaml for `math block` and `front matter`
loadLanguage('latex')
loadLanguage('yaml')

export {
  loadLanguage,
  loadedLanguages,
  transformAliasToOrigin
}

export default prism
