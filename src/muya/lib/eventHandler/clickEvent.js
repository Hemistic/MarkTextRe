import { bindClickHandler } from './clickBindingSupport'
import { bindClickContextMenu } from './clickContextMenuSupport'

class ClickEvent {
  constructor (muya) {
    this.muya = muya
    bindClickHandler(this)
    bindClickContextMenu(this)
  }
}

export default ClickEvent
