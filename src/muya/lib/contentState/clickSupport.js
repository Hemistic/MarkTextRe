import selection from '../selection'
import { isMuyaEditorElement } from '../selection/dom'
import { HAS_TEXT_BLOCK_REG, CLASS_OR_ID } from '../config'
import { getParentCheckBox } from '../utils/getParentCheckBox'
import { cumputeCheckboxStatus } from '../utils/cumputeCheckBoxStatus'

const handleClickBelowLastParagraph = (contentState, event) => {
  const { target } = event
  if (!isMuyaEditorElement(target)) {
    return false
  }

  const lastBlock = contentState.getLastBlock()
  const anchor = contentState.findOutMostBlock(lastBlock)
  const anchorParagraph = document.querySelector(`#${anchor.key}`)
  if (anchorParagraph === null) {
    return false
  }
  const rect = anchorParagraph.getBoundingClientRect()
  if (event.clientY <= rect.top + rect.height) {
    return false
  }

  let needToInsertNewParagraph = false
  if (lastBlock.type === 'span') {
    if (/atxLine|paragraphContent/.test(lastBlock.functionType) && /\S/.test(lastBlock.text)) {
      needToInsertNewParagraph = true
    }
    if (!/atxLine|paragraphContent/.test(lastBlock.functionType)) {
      needToInsertNewParagraph = true
    }
  } else {
    needToInsertNewParagraph = true
  }

  if (needToInsertNewParagraph) {
    event.preventDefault()
    const paragraphBlock = contentState.createBlockP()
    contentState.insertAfter(paragraphBlock, anchor)
    const key = paragraphBlock.children[0].key
    const offset = 0
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    contentState.render()
    return true
  }

  return false
}

const handleFrontMenuClick = (contentState, event) => {
  const { eventCenter } = contentState.muya
  const { target } = event
  const { start: oldStart, end: oldEnd } = contentState.cursor
  if (!(oldStart && oldEnd)) {
    return false
  }

  let hasSameParent = false
  const startBlock = contentState.getBlock(oldStart.key)
  const endBlock = contentState.getBlock(oldEnd.key)
  if (startBlock && endBlock) {
    const startOutBlock = contentState.findOutMostBlock(startBlock)
    const endOutBlock = contentState.findOutMostBlock(endBlock)
    hasSameParent = startOutBlock === endOutBlock
  }

  if (!(target.closest('.ag-front-icon') && hasSameParent)) {
    return false
  }

  const currentBlock = contentState.findOutMostBlock(startBlock)
  const frontIcon = target.closest('.ag-front-icon')
  const rect = frontIcon.getBoundingClientRect()
  const reference = {
    getBoundingClientRect () {
      return rect
    },
    clientWidth: rect.width,
    clientHeight: rect.height,
    id: currentBlock.key
  }
  contentState.selectedBlock = currentBlock
  eventCenter.dispatch('muya-front-menu', { reference, outmostBlock: currentBlock, startBlock, endBlock })
  contentState.partialRender()
  return true
}

const handleFormatClick = (contentState, event) => {
  const { eventCenter } = contentState.muya
  const node = selection.getSelectionStart()
  const inlineNode = node ? node.closest('.ag-inline-rule') : null

  let parentNode = inlineNode
  while (parentNode !== null && parentNode.classList.contains(CLASS_OR_ID.AG_INLINE_RULE)) {
    if (parentNode.tagName === 'A') {
      const formatType = 'link'
      const data = {
        text: inlineNode.textContent,
        href: parentNode.getAttribute('href') || ''
      }
      eventCenter.dispatch('format-click', {
        event,
        formatType,
        data
      })
      break
    }
    parentNode = parentNode.parentNode
  }

  if (!inlineNode) {
    return
  }

  let formatType = null
  let data = null
  switch (inlineNode.tagName) {
    case 'SPAN':
      if (inlineNode.hasAttribute('data-emoji')) {
        formatType = 'emoji'
        data = inlineNode.getAttribute('data-emoji')
      } else if (inlineNode.classList.contains('ag-math-text')) {
        formatType = 'inline_math'
        data = inlineNode.textContent
      }
      break
    case 'STRONG':
      formatType = 'strong'
      data = inlineNode.textContent
      break
    case 'EM':
      formatType = 'em'
      data = inlineNode.textContent
      break
    case 'DEL':
      formatType = 'del'
      data = inlineNode.textContent
      break
    case 'CODE':
      formatType = 'inline_code'
      data = inlineNode.textContent
      break
  }
  if (formatType) {
    eventCenter.dispatch('format-click', {
      event,
      formatType,
      data
    })
  }
}

const handleSelectionFormatPicker = (contentState, block, start, end) => {
  if (
    start.key === end.key &&
    start.offset !== end.offset &&
    HAS_TEXT_BLOCK_REG.test(block.type) &&
    block.functionType !== 'codeContent' &&
    block.functionType !== 'languageInput'
  ) {
    const reference = contentState.getPositionReference()
    const { formats } = contentState.selectionFormats()
    contentState.muya.eventCenter.dispatch('muya-format-picker', { reference, formats })
  }
}

export const clickHandler = (contentState, event) => {
  if (handleClickBelowLastParagraph(contentState, event)) {
    return
  }

  if (handleFrontMenuClick(contentState, event)) {
    return
  }

  const { start, end } = selection.getCursorRange()
  if (!start || !end) {
    return
  }

  handleFormatClick(contentState, event)

  const block = contentState.getBlock(start.key)
  let needRender = false
  handleSelectionFormatPicker(contentState, block, start, end)

  if (block && start.key !== contentState.cursor.start.key) {
    const oldBlock = contentState.getBlock(contentState.cursor.start.key)
    if (oldBlock) {
      needRender = needRender || contentState.codeBlockUpdate(oldBlock)
    }
  }

  if (start.key !== contentState.cursor.start.key || end.key !== contentState.cursor.end.key) {
    needRender = true
  }

  const needMarkedUpdate = contentState.checkNeedRender(contentState.cursor) || contentState.checkNeedRender({ start, end })

  if (needRender) {
    contentState.cursor = { start, end }
    return contentState.partialRender()
  } else if (needMarkedUpdate) {
    requestAnimationFrame(() => {
      const cursor = selection.getCursorRange()
      if (!cursor.start || !cursor.end) {
        return
      }
      contentState.cursor = cursor
      return contentState.partialRender()
    })
  } else {
    contentState.cursor = { start, end }
  }
}

export const setCheckBoxState = (contentState, checkbox, checked) => {
  checkbox.checked = checked
  const block = contentState.getBlock(checkbox.id)
  block.checked = checked
  checkbox.classList.toggle(CLASS_OR_ID.AG_CHECKBOX_CHECKED)
}

export const updateParentsCheckBoxState = (contentState, checkbox) => {
  let parent = getParentCheckBox(checkbox)
  while (parent !== null) {
    const checked = cumputeCheckboxStatus(parent)
    if (parent.checked !== checked) {
      contentState.setCheckBoxState(parent, checked)
      parent = getParentCheckBox(parent)
    } else {
      break
    }
  }
}

export const updateChildrenCheckBoxState = (contentState, checkbox, checked) => {
  const checkboxes = checkbox.parentElement.querySelectorAll(`input ~ ul .${CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX}`)
  for (let i = 0; i < checkboxes.length; i++) {
    const currentCheckbox = checkboxes[i]
    if (currentCheckbox.checked !== checked) {
      contentState.setCheckBoxState(currentCheckbox, checked)
    }
  }
}

export const listItemCheckBoxClick = (contentState, checkbox) => {
  const { checked } = checkbox
  contentState.setCheckBoxState(checkbox, checked)

  const { autoCheck } = contentState.muya.options
  if (autoCheck) {
    contentState.updateChildrenCheckBoxState(checkbox, checked)
    contentState.updateParentsCheckBoxState(checkbox)
  }

  const block = contentState.getBlock(checkbox.id)
  const parentBlock = contentState.getParent(block)
  const firstEditableBlock = contentState.firstInDescendant(parentBlock)
  const { key } = firstEditableBlock
  const offset = 0
  contentState.cursor = { start: { key, offset }, end: { key, offset } }
  return contentState.partialRender()
}
