import selection from '../selection'
import { resolveActiveCursorRange } from './cursorStateSupport'
import {
  checkBackspaceCase
} from './backspaceSupport'
import { handleDocBackspace } from './backspaceHandlerSupport'
import {
  handleBackspaceSelectionStage,
  isCollapsedBackspaceSelection,
  resolveCollapsedBackspaceContext,
  handleCollapsedBackspaceStage
} from './backspaceCtrlSupport'

const backspaceCtrl = ContentState => {
  ContentState.prototype.checkBackspaceCase = function () {
    return checkBackspaceCase(this)
  }

  ContentState.prototype.docBackspaceHandler = function (event) {
    return handleDocBackspace(this, event)
  }

  ContentState.prototype.backspaceHandler = function (event) {
    const cursorContext = resolveActiveCursorRange(this, selection.getCursorRange())
    if (!cursorContext) {
      return
    }
    const { start, end } = cursorContext

    if (handleBackspaceSelectionStage(this, event, cursorContext)) {
      return
    }

    if (!isCollapsedBackspaceSelection(start, end)) {
      return
    }

    const context = resolveCollapsedBackspaceContext(this, cursorContext)
    handleCollapsedBackspaceStage(this, event, cursorContext, context)
  }
}

export default backspaceCtrl
