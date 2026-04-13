import { getMuyaEventCenter } from '../muyaRuntimeAccessSupport'
import {
  bindKeyboardInput,
  bindKeyboardKeydown,
  bindKeyboardKeyup
} from './keyboardBindingSupport'
import {
  bindKeyboardCompositionState,
  bindKeyboardEditorStateDispatch,
  hideKeyboardFloatTools,
  listenKeyboardFloatState,
  scheduleKeyboardInputChangeDispatch
} from './keyboardRuntimeSupport'

class Keyboard {
  constructor (muya) {
    this.muya = muya
    this.isComposed = false
    this.shownFloat = new Set()
    this.inputChangeTimer = null
    this.editorStateTimer = null
    bindKeyboardCompositionState(this)
    bindKeyboardEditorStateDispatch(this)
    bindKeyboardKeydown(this)
    bindKeyboardKeyup(this)
    bindKeyboardInput(this)
    listenKeyboardFloatState(this)
  }

  hideAllFloatTools () {
    hideKeyboardFloatTools(this)
  }

  scheduleInputChangeDispatch (delay = 60) {
    scheduleKeyboardInputChangeDispatch(this, delay)
  }

  destroy () {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer)
      this.inputChangeTimer = null
    }

    if (this.editorStateTimer) {
      clearTimeout(this.editorStateTimer)
      this.editorStateTimer = null
    }

    if (this.floatListener) {
      const eventCenter = getMuyaEventCenter(this.muya)
      eventCenter && eventCenter.unsubscribe('muya-float', this.floatListener)
      this.floatListener = null
    }

    this.shownFloat.clear()
  }
}

export default Keyboard
