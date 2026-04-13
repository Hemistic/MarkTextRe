import { getCursorPositionWithinMarkedText } from './dom'
import {
  isSelectionNodeLike,
  safeApplySelectionRange,
  safeSetSelectionFocus
} from './selectionRangeGuardSupport'

export const applyRangeSelectionSupport = Selection => {
  Object.assign(Selection.prototype, {
    getSelectionHtml () {
      const sel = this.doc.getSelection()
      let i
      let html = ''
      let len
      let container
      if (sel.rangeCount) {
        container = this.doc.createElement('div')
        for (i = 0, len = sel.rangeCount; i < len; i += 1) {
          container.appendChild(sel.getRangeAt(i).cloneContents())
        }
        html = container.innerHTML
      }
      return html
    },

    chopHtmlByCursor (root) {
      const { left } = this.getCaretOffsets(root)
      const markedText = root.textContent
      const { type, info } = getCursorPositionWithinMarkedText(markedText, left)
      const pre = markedText.slice(0, left)
      const post = markedText.slice(left)
      switch (type) {
        case 'OUT':
          return {
            pre,
            post
          }
        case 'IN':
          return {
            pre: `${pre}${info}`,
            post: `${info}${post}`
          }
        case 'LEFT':
          return {
            pre: markedText.slice(0, left - info),
            post: markedText.slice(left - info)
          }
        case 'RIGHT':
          return {
            pre: markedText.slice(0, left + info),
            post: markedText.slice(left + info)
          }
      }
    },

    getCaretOffsets (element, range) {
      let preCaretRange
      let postCaretRange

      if (!isSelectionNodeLike(element)) {
        return { left: 0, right: 0 }
      }

      if (!range) {
        const currentSelection = this.doc.getSelection()
        if (!currentSelection || currentSelection.rangeCount === 0) {
          return { left: 0, right: 0 }
        }
        range = currentSelection.getRangeAt(0)
      }

      preCaretRange = range.cloneRange()
      postCaretRange = range.cloneRange()

      try {
        preCaretRange.selectNodeContents(element)
        preCaretRange.setEnd(range.endContainer, range.endOffset)

        postCaretRange.selectNodeContents(element)
        postCaretRange.setStart(range.endContainer, range.endOffset)
      } catch (error) {
        return { left: 0, right: 0 }
      }

      return {
        left: preCaretRange.toString().length,
        right: postCaretRange.toString().length
      }
    },

    selectNode (node) {
      if (!isSelectionNodeLike(node)) {
        return
      }

      const range = this.doc.createRange()
      try {
        range.selectNodeContents(node)
      } catch (error) {
        return
      }
      this.selectRange(range)
    },

    select (startNode, startOffset, endNode, endOffset) {
      if (!isSelectionNodeLike(startNode)) {
        return null
      }

      const range = this.doc.createRange()
      try {
        range.setStart(startNode, startOffset)
        if (isSelectionNodeLike(endNode)) {
          range.setEnd(endNode, endOffset)
        } else {
          range.collapse(true)
        }
      } catch (error) {
        return null
      }
      this.selectRange(range)
      return range
    },

    setFocus (focusNode, focusOffset) {
      if (!isSelectionNodeLike(focusNode)) {
        return false
      }

      const selection = this.doc.getSelection()
      if (!selection) {
        return false
      }

      return safeSetSelectionFocus(selection, focusNode, focusOffset, this.doc, range => this.selectRange(range))
    },

    clearSelection (moveCursorToStart) {
      const selection = this.doc.getSelection()
      if (!selection) return
      const { rangeCount } = selection
      if (!rangeCount) return
      if (moveCursorToStart) {
        selection.collapseToStart()
      } else {
        selection.collapseToEnd()
      }
    },

    moveCursor (node, offset) {
      this.select(node, offset)
    },

    getSelectionRange () {
      const selection = this.doc.getSelection()
      if (!selection) {
        return null
      }
      if (selection.rangeCount === 0) {
        return null
      }
      return selection.getRangeAt(0)
    },

    selectRange (range) {
      if (!range) {
        return
      }

      const selection = this.doc.getSelection()
      if (!selection) {
        return
      }

      try {
        safeApplySelectionRange(selection, range)
      } catch (error) {
        // Ignore selection restoration failures during DOM transitions.
      }
    },

    getSelectionStart () {
      const selection = this.doc.getSelection()
      const node = selection ? selection.anchorNode : null
      const startNode = (node && node.nodeType === 3 ? node.parentNode : node)

      return startNode
    },

    getSelectionEnd () {
      const selection = this.doc.getSelection()
      const node = selection ? selection.focusNode : null
      const endNode = (node && node.nodeType === 3 ? node.parentNode : node)

      return endNode
    }
  })
}
