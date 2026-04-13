import { markdownToState } from '../utils/markdownState'

export const codeBlockToParagraphs = (contentState, codeBlock) => {
  const codeContent = codeBlock.children[1].children[0].text
  const states = markdownToState(contentState, codeContent)

  for (const state of states) {
    contentState.insertBefore(state, codeBlock)
  }

  contentState.removeBlock(codeBlock)

  const cursorBlock = contentState.firstInDescendant(states[0])
  const { key, text } = cursorBlock
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
}
