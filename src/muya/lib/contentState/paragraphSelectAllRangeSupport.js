import { getContentStateKeyboard } from './runtimeMuyaSupport'

export const isSelectAll = contentState => {
  const firstTextBlock = contentState.getFirstBlock()
  const lastTextBlock = contentState.getLastBlock()
  const { start, end } = contentState.cursor
  const keyboard = getContentStateKeyboard(contentState)

  return firstTextBlock.key === start.key &&
    start.offset === 0 &&
    lastTextBlock.key === end.key &&
    end.offset === lastTextBlock.text.length &&
    !(keyboard && keyboard.isComposed)
}

export const selectAllContent = contentState => {
  const firstTextBlock = contentState.getFirstBlock()
  const lastTextBlock = contentState.getLastBlock()
  contentState.cursor = {
    start: {
      key: firstTextBlock.key,
      offset: 0
    },
    end: {
      key: lastTextBlock.key,
      offset: lastTextBlock.text.length
    }
  }

  return contentState.render()
}
