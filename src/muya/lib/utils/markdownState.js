import { Lexer } from '../parser/marked'
import {
  createMarkdownStateContext,
  getMarkdownStateResult,
  handleMarkdownStateToken
} from './markdownStateTokenSupport'

const languageLoaded = new Set()

export const markdownToState = (contentState, markdown) => {
  const {
    footnote,
    isGitlabCompatibilityEnabled,
    superSubScript
  } = contentState.muya.options

  const tokens = new Lexer({
    disableInline: true,
    footnote,
    isGitlabCompatibilityEnabled,
    superSubScript
  }).lex(markdown)

  const context = createMarkdownStateContext(contentState, languageLoaded)
  let token

  while ((token = tokens.shift())) {
    handleMarkdownStateToken(context, token, tokens)
  }

  return getMarkdownStateResult(context)
}

export const importMarkdown = (contentState, markdown) => {
  contentState.blocks = markdownToState(contentState, markdown)
}
