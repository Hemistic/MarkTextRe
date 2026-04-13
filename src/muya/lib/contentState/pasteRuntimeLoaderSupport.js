let pasteSupportPromise = null
let pasteHandlerSupportPromise = null

export const loadPasteSupport = async () => {
  if (!pasteSupportPromise) {
    pasteSupportPromise = import('./pasteSupport')
  }

  return pasteSupportPromise
}

export const loadPasteHandlerSupport = async () => {
  if (!pasteHandlerSupportPromise) {
    pasteHandlerSupportPromise = import('./pasteHandlerSupport')
  }

  return pasteHandlerSupportPromise
}

export const standardizeContentStateHTML = async (contentState, rawHtml) => {
  const { standardizeHTML } = await loadPasteSupport()
  return standardizeHTML(contentState, rawHtml)
}

export const pasteContentStateImage = async (contentState, event) => {
  const { pasteImage } = await loadPasteSupport()
  return pasteImage(contentState, event)
}

export const handleContentStateDocPaste = async (contentState, event) => {
  const { handleDocPaste } = await loadPasteHandlerSupport()
  return handleDocPaste(contentState, event)
}

export const handleContentStatePaste = async (contentState, event, type = 'normal', rawText, rawHtml) => {
  const { pasteHandler } = await loadPasteHandlerSupport()
  return pasteHandler(contentState, event, type, rawText, rawHtml)
}
