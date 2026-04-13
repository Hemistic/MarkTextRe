import Cursor from '../selection/cursor'
import { createRuntimeAccessors, syncCursorHistory } from './runtimeHistorySupport'

export const defineRuntimeAccessors = ContentState => {
  Object.defineProperties(ContentState.prototype, {
    ...createRuntimeAccessors(ContentState),
    cursor: {
      get () {
        return this.currentCursor
      },
      set (cursor) {
        if (!(cursor instanceof Cursor)) {
          cursor = new Cursor(cursor)
        }

        this.prevCursor = this.currentCursor
        this.currentCursor = cursor
        syncCursorHistory(this, cursor)
      }
    }
  })
}
