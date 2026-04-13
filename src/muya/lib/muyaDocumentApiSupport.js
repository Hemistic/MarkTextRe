import { extractMuyaImages } from './muyaDocumentSupport'

export const exportStyledHTML = async (muya, options) => {
  const { markdown } = muya
  const ExportHtml = await muya.loadMuyaExportHtml()
  return new ExportHtml(markdown, muya).generate(options)
}

export const exportHtml = async muya => {
  const { markdown } = muya
  const ExportHtml = await muya.loadMuyaExportHtml()
  return new ExportHtml(markdown, muya).renderHtml()
}

export const setCursor = (muya, cursor) => {
  const markdown = muya.getMarkdown()
  const isRenderCursor = true

  return muya.setMarkdown(markdown, cursor, isRenderCursor)
}

export const extractImages = (muya, markdown = muya.markdown) => {
  return extractMuyaImages(muya, markdown)
}
