import History from './history'
import { applyContentStateControllers } from './controllerRegistry'
import {
  defineRuntimeAccessors,
  initializeContentState
} from './runtimeSupport'

class ContentState {
  constructor (muya, options) {
    initializeContentState(this, muya, options)
    this.init()
  }
}

applyContentStateControllers(ContentState)
defineRuntimeAccessors(ContentState)

export default ContentState
