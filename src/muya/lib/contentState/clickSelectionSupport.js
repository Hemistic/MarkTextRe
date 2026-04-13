import { HAS_TEXT_BLOCK_REG } from '../config'
import { dispatchContentStateEvent } from './runtimeEventSupport'

export const handleSelectionFormatPicker = (contentState, block, start, end) => {
  if (
    start.key === end.key &&
    start.offset !== end.offset &&
    HAS_TEXT_BLOCK_REG.test(block.type) &&
    block.functionType !== 'codeContent' &&
    block.functionType !== 'languageInput'
  ) {
    const reference = contentState.getPositionReference()
    const { formats } = contentState.selectionFormats()
    dispatchContentStateEvent(contentState, 'muya-format-picker', { reference, formats })
  }
}
