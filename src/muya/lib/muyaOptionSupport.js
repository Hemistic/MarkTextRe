import { CLASS_OR_ID } from './config'

export const setMuyaFocusMode = (muya, enabled) => {
  const { container } = muya
  const { focusMode } = muya.options

  if (enabled && !focusMode) {
    container.classList.add(CLASS_OR_ID.AG_FOCUS_MODE)
  } else {
    container.classList.remove(CLASS_OR_ID.AG_FOCUS_MODE)
  }

  muya.options.focusMode = enabled
}

export const setMuyaFont = (muya, { fontSize, lineHeight }) => {
  if (fontSize) {
    muya.options.fontSize = parseInt(fontSize, 10)
  }

  if (lineHeight) {
    muya.options.lineHeight = lineHeight
  }

  muya.contentState.render(false)
}

export const setMuyaTabSize = (muya, tabSize) => {
  if (!tabSize || typeof tabSize !== 'number') {
    tabSize = 4
  } else if (tabSize < 1) {
    tabSize = 1
  } else if (tabSize > 4) {
    tabSize = 4
  }

  muya.contentState.tabSize = tabSize
}

export const setMuyaListIndentation = (muya, listIndentation) => {
  if (typeof listIndentation === 'number') {
    if (listIndentation < 1 || listIndentation > 4) {
      listIndentation = 1
    }
  } else if (listIndentation !== 'dfm') {
    listIndentation = 1
  }

  muya.contentState.listIndentation = listIndentation
}

export const setMuyaOptions = (muya, options, needRender = false) => {
  // FIXME: Just to be sure, disabled due to #1648.
  if (options.codeBlockLineNumbers) {
    options.codeBlockLineNumbers = false
  }

  Object.assign(muya.options, options)

  if (needRender) {
    muya.contentState.render(false, true)
  }

  const hideQuickInsertHint = options.hideQuickInsertHint
  if (typeof hideQuickInsertHint !== 'undefined') {
    const hasClass = muya.container.classList.contains('ag-show-quick-insert-hint')
    if (hideQuickInsertHint && hasClass) {
      muya.container.classList.remove('ag-show-quick-insert-hint')
    } else if (!hideQuickInsertHint && !hasClass) {
      muya.container.classList.add('ag-show-quick-insert-hint')
    }
  }

  const spellcheckEnabled = options.spellcheckEnabled
  if (typeof spellcheckEnabled !== 'undefined') {
    muya.container.setAttribute('spellcheck', !!spellcheckEnabled)
  }

  if (options.bulletListMarker) {
    muya.contentState.turndownConfig.bulletListMarker = options.bulletListMarker
  }
}
