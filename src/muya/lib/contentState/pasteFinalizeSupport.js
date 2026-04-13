import { applyPasteFragments } from './pasteFragments'
import { isListFragment } from './pasteTypeSupport'
import { dispatchContentStateSelectionAndChange } from './runtimeEventSupport'

export const finalizePasteFragments = (
  contentState,
  startBlock,
  endBlock,
  parent,
  stateFragments,
  startOffset,
  endOffset
) => {
  const { cursor, cursorBlock } = applyPasteFragments(
    contentState,
    startBlock,
    endBlock,
    parent,
    stateFragments,
    startOffset,
    endOffset,
    contentState.checkPasteType.bind(contentState),
    isListFragment
  )

  contentState.cursor = cursor
  contentState.checkInlineUpdate(cursorBlock)
  contentState.partialRender()
  dispatchContentStateSelectionAndChange(contentState)
}
