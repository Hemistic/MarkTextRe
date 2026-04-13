import Cursor from './cursor'
import { CLASS_OR_ID } from '../config'
import {
  findNearestParagraph,
  getOffsetOfParagraph,
  getTextContent
} from './dom'
import {
  querySelectionRoot
} from './root'
import {
  canRestoreCursorRange,
  normalizeSelectionTargets
} from './selectionRangeGuardSupport'

export const applyCursorRangeSupport = Selection => {
  Object.assign(Selection.prototype, {
    setCursorRange (cursorRange) {
      const anchor = cursorRange && (cursorRange.anchor || cursorRange.start)
      const focus = cursorRange && (cursorRange.focus || cursorRange.end)
      const anchorParagraph = anchor && anchor.key ? querySelectionRoot(`#${anchor.key}`) : null
      const focusParagraph = focus && focus.key ? querySelectionRoot(`#${focus.key}`) : null
      if (!canRestoreCursorRange(cursorRange, anchorParagraph, focusParagraph)) {
        return false
      }

      const getNodeAndOffset = (node, offset) => {
        if (node.nodeType === 3) {
          return {
            node,
            offset
          }
        }

        const childNodes = node.childNodes
        const len = childNodes.length
        let i
        let count = 0
        for (i = 0; i < len; i++) {
          const child = childNodes[i]
          const textContent = getTextContent(child, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER])
          const textLength = textContent.length
          if (child.classList && child.classList.contains(CLASS_OR_ID.AG_FRONT_ICON)) {
            continue
          }

          if (/^\n$/.test(textContent) && i !== len - 1 ? count + textLength > offset : count + textLength >= offset) {
            if (
              child.classList && child.classList.contains('ag-inline-image')
            ) {
              const imageContainer = child.querySelector('.ag-image-container')
              const hasImg = imageContainer && imageContainer.querySelector('img')

              if (!hasImg) {
                return {
                  node: child,
                  offset: 0
                }
              }
              if (count + textLength === offset) {
                if (child.nextElementSibling) {
                  return {
                    node: child.nextElementSibling,
                    offset: 0
                  }
                } else {
                  return {
                    node: imageContainer,
                    offset: 1
                  }
                }
              } else if (count === offset && count === 0) {
                return {
                  node: imageContainer,
                  offset: 0
                }
              } else {
                return {
                  node: child,
                  offset: 0
                }
              }
            } else {
              return getNodeAndOffset(child, offset - count)
            }
          } else {
            count += textLength
          }
        }
        return { node, offset }
      }

      const anchorTarget = getNodeAndOffset(anchorParagraph, anchor.offset)
      const focusTarget = getNodeAndOffset(focusParagraph, focus.offset)
      const normalizedTargets = normalizeSelectionTargets(
        anchorTarget.node,
        anchorTarget.offset,
        focusTarget.node,
        focusTarget.offset
      )
      if (!normalizedTargets) {
        return false
      }

      const {
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset
      } = normalizedTargets

      const range = this.select(anchorNode, anchorOffset)
      if (!range) {
        return false
      }

      return this.setFocus(focusNode, focusOffset) !== false
    },

    isValidCursorNode (node) {
      if (!node) return false
      if (node.nodeType === 3) {
        node = node.parentNode
      }

      return typeof node.closest === 'function' && node.closest('.ag-paragraph')
    },

    getCursorRange () {
      const selection = this.doc.getSelection()
      if (!selection) {
        return new Cursor({
          start: null,
          end: null,
          anchor: null,
          focus: null
        })
      }

      let { anchorNode, anchorOffset, focusNode, focusOffset } = selection
      const isAnchorValid = this.isValidCursorNode(anchorNode)
      const isFocusValid = this.isValidCursorNode(focusNode)
      let needFix = false
      if (!isAnchorValid && isFocusValid) {
        needFix = true
        anchorNode = focusNode
        anchorOffset = focusOffset
      } else if (isAnchorValid && !isFocusValid) {
        needFix = true
        focusNode = anchorNode
        focusOffset = anchorOffset
      } else if (!isAnchorValid && !isFocusValid) {
        return new Cursor({
          start: null,
          end: null,
          anchor: null,
          focus: null
        })
      }

      if (
        anchorNode === focusNode &&
        anchorOffset === focusOffset &&
        anchorNode.textContent === '\n' &&
        focusOffset === 0
      ) {
        focusOffset = anchorOffset = 1
      }

      const anchorParagraph = findNearestParagraph(anchorNode)
      const focusParagraph = findNearestParagraph(focusNode)
      if (!anchorParagraph || !focusParagraph) {
        return new Cursor({
          start: null,
          end: null,
          anchor: null,
          focus: null
        })
      }

      let aOffset = getOffsetOfParagraph(anchorNode, anchorParagraph) + anchorOffset
      let fOffset = getOffsetOfParagraph(focusNode, focusParagraph) + focusOffset

      if (
        anchorNode === focusNode &&
        anchorOffset === focusOffset &&
        anchorNode.parentNode.classList.contains('ag-image-container') &&
        anchorNode.previousElementSibling &&
        anchorNode.previousElementSibling.nodeName === 'IMG'
      ) {
        const imageWrapper = anchorNode.parentNode.parentNode
        const preElement = imageWrapper.previousElementSibling
        aOffset = 0
        if (preElement) {
          aOffset += getOffsetOfParagraph(preElement, anchorParagraph)
          aOffset += getTextContent(preElement, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER]).length
        }
        aOffset += getTextContent(imageWrapper, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER]).length
        fOffset = aOffset
      }

      if (
        anchorNode === focusNode &&
        anchorNode.nodeType === 1 &&
        anchorNode.classList.contains('ag-image-container')
      ) {
        const imageWrapper = anchorNode.parentNode
        const preElement = imageWrapper.previousElementSibling
        aOffset = 0
        if (preElement) {
          aOffset += getOffsetOfParagraph(preElement, anchorParagraph)
          aOffset += getTextContent(preElement, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER]).length
        }
        if (anchorOffset === 1) {
          aOffset += getTextContent(imageWrapper, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER]).length
        }
        fOffset = aOffset
      }

      const anchor = { key: anchorParagraph.id, offset: aOffset }
      const focus = { key: focusParagraph.id, offset: fOffset }
      const result = new Cursor({ anchor, focus })

      if (needFix) {
        this.setCursorRange(result)
      }

      return result
    },

    getCursorYOffset (paragraph) {
      const { y } = this.getCursorCoords()
      const { height, top } = paragraph.getBoundingClientRect()
      const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight)
      const topOffset = Math.round((y - top) / lineHeight)
      const bottomOffset = Math.round((top + height - lineHeight - y) / lineHeight)

      return {
        topOffset,
        bottomOffset
      }
    },

    getCursorCoords () {
      const sel = this.doc.getSelection()
      let range
      let x = 0
      let y = 0
      let width = 0

      if (sel.rangeCount) {
        range = sel.getRangeAt(0).cloneRange()
        if (range.getClientRects) {
          let rects = range.getClientRects()
          if (rects.length === 0 && range.startContainer && (range.startContainer.nodeType === Node.ELEMENT_NODE || range.startContainer.nodeType === Node.TEXT_NODE)) {
            const parentElement = range.startContainer.nodeType === Node.ELEMENT_NODE
              ? range.startContainer
              : range.startContainer.parentElement
            rects = parentElement ? parentElement.getClientRects() : []
            if (rects.length) {
              const rect = rects[0]
              rect.y = rect.y + 1
            }
          }
          if (rects.length) {
            const { left, top, x: rectX, y: rectY, width: rWidth } = rects[0]
            x = rectX || left
            y = rectY || top
            width = rWidth
          }
        }
      }

      return { x, y, width }
    }
  })
}
