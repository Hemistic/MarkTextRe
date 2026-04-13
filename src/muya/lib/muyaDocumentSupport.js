import { wordCount } from './utils'
import ExportMarkdown from './utils/exportMarkdown'
import { getCodeMirrorCursor, addCursorToMarkdown, importCursor } from './utils/markdownCursor'
import { extractImagesFromMarkdown } from './utils/markdownImages'
import { importMarkdown as importMarkdownState } from './utils/markdownState'

let exportHtmlModulePromise = null

export const getMuyaMarkdown = muya => {
  const blocks = muya.contentState.getBlocks()
  const { isGitlabCompatibilityEnabled, listIndentation } = muya.contentState

  return new ExportMarkdown(blocks, listIndentation, isGitlabCompatibilityEnabled).generate()
}

export const loadMuyaExportHtml = async () => {
  if (!exportHtmlModulePromise) {
    exportHtmlModulePromise = import('./utils/exportHtml')
  }

  const module = await exportHtmlModulePromise
  return module.default
}

export const calculateMuyaWordCount = markdown => wordCount(markdown)

export const getMuyaCursor = muya => getCodeMirrorCursor(muya.contentState)

export const setMuyaMarkdown = (muya, markdown, cursor, isRenderCursor = true) => {
  let nextMarkdown = markdown
  let isValid = false

  if (cursor && cursor.anchor && cursor.focus) {
    const cursorInfo = addCursorToMarkdown(markdown, cursor)
    nextMarkdown = cursorInfo.markdown
    isValid = cursorInfo.isValid
  }

  importMarkdownState(muya.contentState, nextMarkdown)
  importCursor(muya.contentState, cursor && isValid)
  muya.contentState.render(isRenderCursor)

  setTimeout(() => {
    muya.dispatchChange()
  }, 0)
}

export const extractMuyaImages = (muya, markdown = muya.markdown) => {
  return extractImagesFromMarkdown(muya.contentState, markdown)
}
