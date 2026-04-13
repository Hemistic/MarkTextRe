export const createTable = (muya, tableChecker) => {
  return muya.contentState.createTable(tableChecker)
}

export const getSelection = muya => {
  return muya.contentState.selectionChange()
}

export const updateParagraph = (muya, type) => {
  muya.contentState.updateParagraph(type)
}

export const duplicate = muya => {
  muya.contentState.duplicate()
}

export const deleteParagraph = muya => {
  muya.contentState.deleteParagraph()
}

export const insertParagraph = (muya, location, text = '', outMost = false) => {
  muya.contentState.insertParagraph(location, text, outMost)
}

export const editTable = (muya, data) => {
  muya.contentState.editTable(data)
}

export const hasFocus = muya => {
  return document.activeElement === muya.container
}

export const focus = muya => {
  muya.contentState.setCursor()
  muya.container.focus()
}

export const blur = (muya, isRemoveAllRange = false, unSelect = false) => {
  if (isRemoveAllRange) {
    const selection = document.getSelection()
    selection.removeAllRanges()
  }

  if (unSelect) {
    muya.contentState.selectedImage = null
    muya.contentState.selectedTableCells = null
  }

  muya.hideAllFloatTools()
  muya.container.blur()
}

export const format = (muya, type) => {
  muya.contentState.format(type)
}

export const insertImage = (muya, imageInfo) => {
  muya.contentState.insertImage(imageInfo)
}

export const search = (muya, value, opt) => {
  const { selectHighlight } = opt
  muya.contentState.search(value, opt)
  muya.contentState.render(!!selectHighlight)
  return muya.contentState.searchMatches
}

export const replace = (muya, value, opt) => {
  muya.contentState.replace(value, opt)
  muya.contentState.render(false)
  return muya.contentState.searchMatches
}

export const find = (muya, action) => {
  muya.contentState.find(action)
  muya.contentState.render(false)
  return muya.contentState.searchMatches
}

export const setOptions = (muya, options, needRender = false) => {
  return setMuyaOptions(muya, options, needRender)
}

export const hideAllFloatTools = muya => {
  return muya.keyboard.hideAllFloatTools()
}

export const replaceWordInline = (muya, line, wordCursor, replacement, setCursor = false) => {
  muya.contentState.replaceWordInline(line, wordCursor, replacement, setCursor)
}

export const replaceCurrentWordInlineUnsafe = (muya, word, replacement) => {
  return muya.contentState._replaceCurrentWordInlineUnsafe(word, replacement)
}
import { setMuyaOptions } from './muyaOptionSupport'
