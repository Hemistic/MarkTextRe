import { CLASS_OR_ID } from '../../../config'
import { h } from '../snabbdom'
import {
  applyEditableState,
  decorateCodeContainer,
  decorateFigureBlock,
  decorateHeadingBlock,
  decorateListBlock,
  decoratePreBlock,
  decorateTableCell,
  updateRenderingContext
} from './renderContainerSupport'

export default function renderContainerBlock (parent, block, activeBlocks, matches, useCache = false) {
  let selector = this.getSelector(block, activeBlocks)
  const {
    type,
    editable,
    listType,
    listItemType
  } = block

  updateRenderingContext(this, block)

  const children = block.children.map(child => this.renderBlock(block, child, activeBlocks, matches, useCache))
  const data = {
    attrs: {},
    dataset: {}
  }

  applyEditableState(data, editable)

  selector = decorateCodeContainer(this, selector, data, children, block, parent)

  if (/^(?:th|td)$/.test(type)) {
    selector = decorateTableCell(this, selector, data, children, block, activeBlocks, parent)
  } else if (/^h/.test(type)) {
    selector = decorateHeadingBlock(selector, data, block)
  } else if (type === 'figure') {
    selector = decorateFigureBlock(this, selector, data, children, block, activeBlocks)
  } else if (/ul|ol/.test(type) && listType) {
    selector = decorateListBlock(selector, data, block)
  } else if (type === 'li' && listItemType) {
    selector = decorateListBlock(selector, data, block)
  } else if (type === 'pre') {
    selector = decoratePreBlock(this, selector, data, block)
  }

  const shouldRenderFrontIcon = !block.parent && type !== 'pre' && type !== 'figure'
  if (shouldRenderFrontIcon) {
    children.unshift(this.renderIcon(block))
  }

  return h(selector, data, children)
}
