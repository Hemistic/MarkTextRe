import {
  getClosestBlockContainer,
  getFirstSelectableLeafNode,
  isBlockContainer,
  traverseUp
} from './dom'

const filterOnlyParentElements = node => {
  return isBlockContainer(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
}

export const applyImportSelectionSupport = Selection => {
  Object.assign(Selection.prototype, {
    findMatchingSelectionParent (testElementFunction, contentWindow) {
      const selection = contentWindow.getSelection()
      let range
      let current

      if (selection.rangeCount === 0) {
        return false
      }

      range = selection.getRangeAt(0)
      current = range.commonAncestorContainer

      return traverseUp(current, testElementFunction)
    },

    importSelection (selectionState, root, favorLaterSelectionAnchor) {
      if (!selectionState || !root) {
        throw new Error('your must provide a [selectionState] and a [root] element')
      }

      let range = this.doc.createRange()
      range.setStart(root, 0)
      range.collapse(true)

      let node = root
      const nodeStack = []
      let charIndex = 0
      let foundStart = false
      let foundEnd = false
      let trailingImageCount = 0
      let stop = false
      let nextCharIndex
      let allowRangeToStartAtEndOfNode = false
      let lastTextNode = null

      if (favorLaterSelectionAnchor || selectionState.startsWithImage || typeof selectionState.emptyBlocksIndex !== 'undefined') {
        allowRangeToStartAtEndOfNode = true
      }

      while (!stop && node) {
        if (node.nodeType > 3) {
          node = nodeStack.pop()
          continue
        }

        if (node.nodeType === 3 && !foundEnd) {
          nextCharIndex = charIndex + node.length
          if (!foundStart && selectionState.start >= charIndex && selectionState.start <= nextCharIndex) {
            if (allowRangeToStartAtEndOfNode || selectionState.start < nextCharIndex) {
              range.setStart(node, selectionState.start - charIndex)
              foundStart = true
            } else {
              lastTextNode = node
            }
          }

          if (foundStart && selectionState.end >= charIndex && selectionState.end <= nextCharIndex) {
            if (!selectionState.trailingImageCount) {
              range.setEnd(node, selectionState.end - charIndex)
              stop = true
            } else {
              foundEnd = true
            }
          }
          charIndex = nextCharIndex
        } else {
          if (selectionState.trailingImageCount && foundEnd) {
            if (node.nodeName.toLowerCase() === 'img') {
              trailingImageCount++
            }
            if (trailingImageCount === selectionState.trailingImageCount) {
              let endIndex = 0
              while (node.parentNode.childNodes[endIndex] !== node) {
                endIndex++
              }
              range.setEnd(node.parentNode, endIndex + 1)
              stop = true
            }
          }

          if (!stop && node.nodeType === 1) {
            let i = node.childNodes.length - 1
            while (i >= 0) {
              nodeStack.push(node.childNodes[i])
              i -= 1
            }
          }
        }

        if (!stop) {
          node = nodeStack.pop()
        }
      }

      if (!foundStart && lastTextNode) {
        range.setStart(lastTextNode, lastTextNode.length)
        range.setEnd(lastTextNode, lastTextNode.length)
      }

      if (typeof selectionState.emptyBlocksIndex !== 'undefined') {
        range = this.importSelectionMoveCursorPastBlocks(root, selectionState.emptyBlocksIndex, range)
      }

      if (favorLaterSelectionAnchor) {
        range = this.importSelectionMoveCursorPastAnchor(selectionState, range)
      }

      this.selectRange(range)
    },

    importSelectionMoveCursorPastAnchor (selectionState, range) {
      const nodeInsideAnchorTagFunction = function (node) {
        return node.nodeName.toLowerCase() === 'a'
      }

      if (
        selectionState.start === selectionState.end &&
        range.startContainer.nodeType === 3 &&
        range.startOffset === range.startContainer.nodeValue.length &&
        traverseUp(range.startContainer, nodeInsideAnchorTagFunction)
      ) {
        let prevNode = range.startContainer
        let currentNode = range.startContainer.parentNode
        while (currentNode !== null && currentNode.nodeName.toLowerCase() !== 'a') {
          if (currentNode.childNodes[currentNode.childNodes.length - 1] !== prevNode) {
            currentNode = null
          } else {
            prevNode = currentNode
            currentNode = currentNode.parentNode
          }
        }
        if (currentNode !== null && currentNode.nodeName.toLowerCase() === 'a') {
          let currentNodeIndex = null
          for (let i = 0; currentNodeIndex === null && i < currentNode.parentNode.childNodes.length; i++) {
            if (currentNode.parentNode.childNodes[i] === currentNode) {
              currentNodeIndex = i
            }
          }
          range.setStart(currentNode.parentNode, currentNodeIndex + 1)
          range.collapse(true)
        }
      }

      return range
    },

    importSelectionMoveCursorPastBlocks (root, index = 1, range) {
      const treeWalker = this.doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, filterOnlyParentElements, false)
      const startContainer = range.startContainer
      let startBlock
      let targetNode
      let currIndex = 0

      if (startContainer.nodeType === 3 && isBlockContainer(startContainer.previousSibling)) {
        startBlock = startContainer.previousSibling
      } else {
        startBlock = getClosestBlockContainer(startContainer)
      }

      while (treeWalker.nextNode()) {
        if (!targetNode) {
          if (startBlock === treeWalker.currentNode) {
            targetNode = treeWalker.currentNode
          }
        } else {
          targetNode = treeWalker.currentNode
          currIndex++
          if (currIndex === index) {
            break
          }
          if (targetNode.textContent.length > 0) {
            break
          }
        }
      }

      if (!targetNode) {
        targetNode = startBlock
      }

      range.setStart(getFirstSelectableLeafNode(targetNode), 0)

      return range
    }
  })
}
