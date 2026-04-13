import { dispatchContentStateStateChange } from './runtimeEventSupport'

export const insertParagraph = (contentState, location, text = '', outMost = false) => {
  const { start, end } = contentState.cursor
  if (start.key !== end.key) return

  const block = contentState.getBlock(start.key)
  let anchor = null
  if (outMost) {
    anchor = contentState.findOutMostBlock(block)
  } else {
    anchor = contentState.getAnchor(block)
  }

  if (!anchor || anchor && anchor.functionType === 'frontmatter' && location === 'before') {
    return
  }

  const newBlock = contentState.createBlockP(text)
  if (location === 'before') {
    contentState.insertBefore(newBlock, anchor)
  } else {
    contentState.insertAfter(newBlock, anchor)
  }
  const { key } = newBlock.children[0]
  const offset = text.length
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }
  contentState.partialRender()
  dispatchContentStateStateChange(contentState)
}
