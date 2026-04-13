import { beginRules } from '../parser/rules'
import { checkNotSameToken } from './inputTokenSupport'
import { collectInputText } from './inputAutoPairRuleSupport'
import {
  handleAutoPairDeletion,
  handleAutoPairInsertion
} from './inputAutoPairMutationSupport'

export { collectInputText } from './inputAutoPairRuleSupport'

export const applyAutoPair = (contentState, block, text, start, end, oldStart, event) => {
  let needRender = false

  if (
    start.key === end.key &&
    start.offset === end.offset &&
    event.type === 'input'
  ) {
    const deletionResult = handleAutoPairDeletion(text, block, start, end, event)
    text = deletionResult.text
    needRender = deletionResult.needRender

    if (!/^delete/.test(event.inputType)) {
      const insertionResult = handleAutoPairInsertion(contentState, block, text, start, event)
      text = insertionResult.text
      needRender = needRender || insertionResult.needRender
    }
  }

  if (checkNotSameToken(contentState, block.functionType, block.text, text)) {
    needRender = true
  }

  if (
    block.text.endsWith('\n') &&
    start.offset === text.length &&
    (event.inputType === 'insertText' || event.type === 'compositionend')
  ) {
    block.text += event.data
    start.offset++
    end.offset++
  } else if (
    block.text.length === oldStart.offset &&
    block.text[oldStart.offset - 2] === '\n' &&
    event.inputType === 'deleteContentBackward'
  ) {
    block.text = block.text.substring(0, oldStart.offset - 1)
    start.offset = block.text.length
    end.offset = block.text.length
  } else {
    block.text = text
  }

  if (block.functionType === 'languageInput') {
    const parent = contentState.getParent(block)
    parent.lang = block.text
  }

  const needRenderAll = beginRules.reference_definition.test(text)

  return {
    needRender,
    needRenderAll,
    text: block.text
  }
}
