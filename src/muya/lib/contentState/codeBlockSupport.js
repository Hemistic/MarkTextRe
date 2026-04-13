import { escapeHTML } from '../utils'
import { getContentStateClipboard } from './runtimeMuyaSupport'
import {
  queueCodeBlockLanguageRender,
  resolveEditLanguage
} from './codeBlockLanguageSupport'
import {
  convertParagraphToCodeBlock,
  syncCodeBlockLanguageInput
} from './codeBlockMutationSupport'

const CODE_UPDATE_REP = /^`{3,}(.*)/

export const checkEditLanguage = contentState => {
  return resolveEditLanguage(contentState)
}

export const selectLanguage = (contentState, paragraph, lang) => {
  const block = contentState.getBlock(paragraph.id)
  if (lang === 'math' && contentState.isGitlabCompatibilityEnabled && contentState.updateMathBlock(block)) {
    return
  }
  contentState.updateCodeLanguage(block, lang)
}

export const updateCodeLanguage = (contentState, block, lang) => {
  if (!lang || typeof lang !== 'string') {
    console.error('Invalid code block language string:', lang)
    lang = ''
  }

  lang = escapeHTML(lang)
  if (lang !== '') {
    queueCodeBlockLanguageRender(contentState, lang)
  }

  if (block.functionType === 'languageInput') {
    syncCodeBlockLanguageInput(contentState, block, lang)
  } else {
    block.text = block.text.replace(/^(`+)([^`]+$)/g, `$1${lang}`)
    contentState.codeBlockUpdate(block)
  }
  contentState.partialRender()
}

export const codeBlockUpdate = (contentState, block, code = '', lang) => {
  if (block.type === 'span') {
    block = contentState.getParent(block)
  }
  if (block.type !== 'p') return false
  if (block.children.length !== 1) return false

  const { text } = block.children[0]
  const match = CODE_UPDATE_REP.exec(text)
  if (match || lang) {
    const language = lang || (match ? match[1] : '')

    if (language) {
      queueCodeBlockLanguageRender(contentState, language)
    }

    convertParagraphToCodeBlock(contentState, block, code, language)
    return true
  }
  return false
}

export const copyCodeBlock = (contentState, event) => {
  const { target } = event
  const preEle = target.closest('pre')
  const preBlock = contentState.getBlock(preEle.id)
  const codeBlock = preBlock.children.find(c => c.type === 'code')
  const codeContent = codeBlock.children[0].text
  const clipboard = getContentStateClipboard(contentState)
  if (clipboard && typeof clipboard.copy === 'function') {
    clipboard.copy('copyCodeContent', codeContent)
  }
}
