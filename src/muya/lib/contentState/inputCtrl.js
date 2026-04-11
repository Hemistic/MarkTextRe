import selection from '../selection'
import {
  checkQuickInsert,
  checkCursorInTokenType,
  checkNotSameToken,
  collectInputText,
  applyAutoPair,
  createQuickInsertReference
} from './inputSupport'

// TODO: refactor later.
let renderCodeBlockTimer = null

const inputCtrl = ContentState => {
  // Input @ to quick insert paragraph
  ContentState.prototype.checkQuickInsert = function (block) {
    return checkQuickInsert(block)
  }

  ContentState.prototype.checkCursorInTokenType = function (functionType, text, offset, type) {
    return checkCursorInTokenType(this, functionType, text, offset, type)
  }

  ContentState.prototype.checkNotSameToken = function (functionType, oldText, text) {
    return checkNotSameToken(this, functionType, oldText, text)
  }

  ContentState.prototype.inputHandler = function (event, notEqual = false) {
    const { start, end } = selection.getCursorRange()
    if (!start || !end) {
      return
    }

    const { start: oldStart, end: oldEnd } = this.cursor
    const key = start.key
    const block = this.getBlock(key)
    const paragraph = document.querySelector(`#${key}`)

    // Fix issue 1447
    // Fixme: any better solution?
    if (
      oldStart.key === oldEnd.key &&
      oldStart.offset === oldEnd.offset &&
      block.text.endsWith('\n') &&
      oldStart.offset === block.text.length &&
      event.inputType === 'insertText'
    ) {
      event.preventDefault()
      block.text += event.data
      const offset = block.text.length
      this.cursor = {
        start: { key, offset },
        end: { key, offset }
      }
      this.singleRender(block)
      return this.inputHandler(event, true)
    }

    let text = collectInputText(paragraph)

    let needRender = false
    let needRenderAll = false
    if (oldStart.key !== oldEnd.key) {
      const startBlock = this.getBlock(oldStart.key)
      const startOutmostBlock = this.findOutMostBlock(startBlock)
      const endBlock = this.getBlock(oldEnd.key)
      const endOutmostBlock = this.findOutMostBlock(endBlock)
      if (startBlock.functionType === 'languageInput') {
        // fix #918.
        if (startOutmostBlock === endOutmostBlock && !endBlock.nextSibling) {
          this.removeBlocks(startBlock, endBlock, false)
          endBlock.text = ''
        } else if (startOutmostBlock !== endOutmostBlock) {
          const preBlock = this.getParent(startBlock)
          const pBlock = this.createBlock('p')
          this.removeBlocks(startBlock, endBlock)
          startBlock.functionType = 'paragraphContent'
          this.appendChild(pBlock, startBlock)
          this.insertBefore(pBlock, preBlock)
          this.removeBlock(preBlock)
        } else {
          this.removeBlocks(startBlock, endBlock)
        }
      } else if (startBlock.functionType === 'paragraphContent' &&
        start.key === end.key && oldStart.key === start.key && oldEnd.key !== end.key) {
        // GH#2269: The end block will lose all soft-lines when removing multiple paragraphs and `oldEnd`
        //          includes soft-line breaks. The normal text from `oldEnd` is moved into the `start`
        //          block but the remaining soft-lines (separated by \n) not. We have to append the
        //          remaining text (soft-lines) to the new start block.
        const matchBreak = /(?<=.)\n./.exec(endBlock.text)
        if (matchBreak && matchBreak.index > 0) {
          // Skip if end block is fully selected and the cursor is in the next line (e.g. via keyboard).
          const lineOffset = matchBreak.index
          if (oldEnd.offset <= lineOffset) {
            text += endBlock.text.substring(lineOffset)
          }
        }
        this.removeBlocks(startBlock, endBlock)
      } else {
        this.removeBlocks(startBlock, endBlock)
      }
      if (this.blocks.length === 1) {
        needRenderAll = true
      }
      needRender = true
    }

    // auto pair (not need to auto pair in math block)
    if (block && (block.text !== text || notEqual)) {
      const autoPairResult = applyAutoPair(this, block, text, start, end, oldStart, event)
      needRender = needRender || autoPairResult.needRender
      needRenderAll = needRenderAll || autoPairResult.needRenderAll
    }

    // show quick insert
    const quickInsert = createQuickInsertReference(this, paragraph, block)
    this.muya.eventCenter.dispatch('muya-quick-insert', quickInsert.reference, block, quickInsert.show)

    this.cursor = { start, end }

    // Throttle render if edit in code block.
    if (block && block.type === 'span' && block.functionType === 'codeContent') {
      if (renderCodeBlockTimer) {
        clearTimeout(renderCodeBlockTimer)
      }
      if (needRender) {
        this.partialRender()
      } else {
        renderCodeBlockTimer = setTimeout(() => {
          this.partialRender()
        }, 300)
      }
      return
    }

    const checkMarkedUpdate = /atxLine|paragraphContent|cellContent/.test(block.functionType)
      ? this.checkNeedRender()
      : false
    let inlineUpdatedBlock = null
    if (/atxLine|paragraphContent|cellContent|thematicBreakLine/.test(block.functionType)) {
      inlineUpdatedBlock = this.isCollapse() && this.checkInlineUpdate(block)
    }

    // just for fix #707,need render All if in combines pre list and next list into one list.
    if (inlineUpdatedBlock) {
      const liBlock = this.getParent(inlineUpdatedBlock)
      if (liBlock && liBlock.type === 'li' && liBlock.preSibling && liBlock.nextSibling) {
        needRenderAll = true
      }
    }

    if (checkMarkedUpdate || inlineUpdatedBlock || needRender) {
      return needRenderAll ? this.render() : this.partialRender()
    }
  }
}

export default inputCtrl
