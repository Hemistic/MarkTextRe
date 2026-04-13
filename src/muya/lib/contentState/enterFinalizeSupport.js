
import {
  resolveEnterCursorTarget,
  resolveHtmlEnterOffset,
  shouldPreserveCodeBlockEnterCursor
} from './enterCodeBlockCursorSupport'

export const finalizeEnter = (contentState, block, newBlock, getParagraphBlock) => {
  contentState.codeBlockUpdate(getParagraphBlock(newBlock))
  const preParagraphBlock = getParagraphBlock(block)
  const blockNeedFocus = contentState.codeBlockUpdate(preParagraphBlock)
  const tableNeedFocus = contentState.tableBlockUpdate(preParagraphBlock)
  const htmlNeedFocus = contentState.updateHtmlBlock(preParagraphBlock)
  const mathNeedFocus = contentState.updateMathBlock(preParagraphBlock)
  const preserveExistingCursor = shouldPreserveCodeBlockEnterCursor(
    contentState,
    blockNeedFocus,
    block,
    getParagraphBlock
  )
  let cursorBlock

  if (!preserveExistingCursor) {
    switch (true) {
      case !!blockNeedFocus:
        cursorBlock = block
        break
      case !!tableNeedFocus:
        cursorBlock = tableNeedFocus
        break
      case !!htmlNeedFocus:
        cursorBlock = htmlNeedFocus.children[0].children[0]
        break
      case !!mathNeedFocus:
        cursorBlock = mathNeedFocus
        break
      default:
        cursorBlock = newBlock
        break
    }
  } else {
    cursorBlock = getParagraphBlock(block)
  }

  if (!preserveExistingCursor) {
    cursorBlock = getParagraphBlock(cursorBlock)
    const cursorTarget = resolveEnterCursorTarget(cursorBlock)
    const key = cursorTarget.key
    let offset = 0

    if (htmlNeedFocus) {
      offset = resolveHtmlEnterOffset(cursorBlock)
    }

    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
  }

  let needRenderAll = false
  if (contentState.isCollapse() && cursorBlock.type === 'p') {
    contentState.checkInlineUpdate(cursorBlock.children[0])
    needRenderAll = true
  }

  needRenderAll ? contentState.render() : contentState.partialRender()
}
