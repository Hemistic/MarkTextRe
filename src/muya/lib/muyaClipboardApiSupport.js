export const copyAsMarkdown = muya => {
  muya.clipboard.copyAsMarkdown()
}

export const copyAsHtml = muya => {
  muya.clipboard.copyAsHtml()
}

export const pasteAsPlainText = muya => {
  muya.clipboard.pasteAsPlainText()
}

export const copy = (muya, info) => {
  return muya.clipboard.copy('copyBlock', info)
}
