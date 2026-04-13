/**
 * This file is copy from [medium-editor](https://github.com/yabwe/medium-editor)
 * and customize for specialized use.
 */
import { setSelectionRoot } from './root'
import { applyCursorRangeSupport } from './cursorRangeSupport'
import { applyImportSelectionSupport } from './importSelectionSupport'
import { applyRangeSelectionSupport } from './rangeSelectionSupport'

class Selection {
  constructor (doc) {
    this.doc = doc
  }

  setRoot (root) {
    setSelectionRoot(root)
  }
}

applyImportSelectionSupport(Selection)
applyRangeSelectionSupport(Selection)
applyCursorRangeSupport(Selection)

export default new Selection(document)
