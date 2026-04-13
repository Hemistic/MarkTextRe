import { CLASS_OR_ID } from '../../../config'
import { h } from '../snabbdom'
import {
  renderCodeContentBlock,
  renderDivBlock,
  renderInputBlock,
  renderLanguageInputBlock,
  renderTokenChildren,
  resolveLeafTokens
} from './renderLeafSupport'

export default function renderLeafBlock (parent, block, activeBlocks, matches, useCache = false) {
  const { cursor } = this.muya.contentState
  const isCodeBlockEditing = block.type === 'span' &&
    block.functionType === 'codeContent' &&
    cursor.start.key === block.key
  let selector = this.getSelector(block, activeBlocks)
  const { highlights, tokens } = resolveLeafTokens(this, block, matches, useCache)
  const {
    text,
    type,
    functionType,
    editable
  } = block

  const data = {
    props: {},
    attrs: {},
    dataset: {},
    style: {}
  }

  let children = ''

  if (text) {
    children = renderTokenChildren(this, block, cursor, tokens)
  }

  if (editable === false) {
    Object.assign(data.attrs, {
      spellcheck: 'false',
      contenteditable: 'false'
    })
  }

  if (type === 'div') {
    const leafState = renderDivBlock(this, selector, data, block)
    selector = leafState.selector
    children = leafState.children
  } else if (type === 'input') {
    const leafState = renderInputBlock(this, selector, data, block)
    selector = leafState.selector
    children = leafState.children
  } else if (type === 'span' && functionType === 'codeContent') {
    const leafState = renderCodeContentBlock(this, selector, block, highlights, isCodeBlockEditing)
    selector = leafState.selector
    children = leafState.children
    Object.assign(data.props, leafState.data?.props)
  } else if (type === 'span' && functionType === 'languageInput') {
    children = renderLanguageInputBlock(text, highlights)
  } else if (type === 'span' && functionType === 'footnoteInput') {
    Object.assign(data.attrs, { spellcheck: 'false' })
  }

  if (!block.parent) {
    return h(selector, data, [this.renderIcon(block), ...children])
  } else {
    return h(selector, data, children)
  }
}
