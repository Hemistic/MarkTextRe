import selection from '../selection'
import { ensureLanguageLoaded } from '../prism/runtimeSupport'
import { queryContentState } from './runtimeDomSupport'
import { resolveCursorRangeBlocks } from './cursorStateSupport'

const EDITABLE_LANGUAGE_RE = /(^`{3,})([^`]+)/

export const resolveEditLanguage = contentState => {
  const cursorContext = resolveCursorRangeBlocks(contentState, selection.getCursorRange())
  if (!cursorContext) {
    return { lang: '', paragraph: null }
  }

  const { start, startBlock } = cursorContext
  let lang = ''
  const { text } = startBlock

  if (startBlock.type === 'span') {
    if (startBlock.functionType === 'languageInput') {
      lang = text.trim()
    } else if (startBlock.functionType === 'paragraphContent') {
      const token = text.match(EDITABLE_LANGUAGE_RE)
      if (token) {
        const len = token[1].length
        if (start.offset >= len) {
          lang = token[2].trim()
        }
      }
    }
  }

  return {
    lang,
    paragraph: lang ? queryContentState(contentState, `#${start.key}`) : null
  }
}

export const queueCodeBlockLanguageRender = (contentState, lang) => {
  if (!lang) {
    return
  }

  ensureLanguageLoaded(lang)
    .then(() => {
      contentState.render()
    })
    .catch(err => {
      console.warn(err)
    })
}
