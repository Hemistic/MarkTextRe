import { dispatchContentStateEvent } from './runtimeEventSupport'

export const pasteIntoLanguageInput = (contentState, startBlock, start, end, text) => {
  let language = text.trim().match(/^.*$/m)[0] || ''
  const oldLanguageLength = startBlock.text.length
  let offset = 0

  if (start.offset !== 0 || end.offset !== oldLanguageLength) {
    const prePartText = startBlock.text.substring(0, start.offset)
    const postPartText = startBlock.text.substring(end.offset)
    language = prePartText + language + postPartText
    offset = prePartText.length + language.length
  } else {
    offset = language.length
  }

  startBlock.text = language
  const key = startBlock.key
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  dispatchContentStateEvent(contentState, 'muya-code-picker', { reference: null })
  contentState.updateCodeLanguage(startBlock, language)
}

export const pasteIntoCodeContent = (contentState, startBlock, start, end, text) => {
  const blockText = startBlock.text
  const prePartText = blockText.substring(0, start.offset)
  const postPartText = blockText.substring(end.offset)
  startBlock.text = prePartText + text + postPartText
  const { key } = startBlock
  const offset = start.offset + text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  contentState.partialRender()
}
