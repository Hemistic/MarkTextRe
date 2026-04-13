import { CLASS_OR_ID } from '../../config'
import { patch, toVNode, toHTML, h } from './snabbdom'
import { getStateRenderEditor, queryStateRenderEditor } from '../../contentState/runtimeDomSupport'

const shouldReplaceBlockDom = block => block && /^(?:pre|figure)$/.test(block.type)
const isReplaceSensitiveBlock = block => {
  if (!block) {
    return false
  }

  if (
    shouldReplaceBlockDom(block) ||
    block.functionType === 'codeContent' ||
    block.functionType === 'languageInput'
  ) {
    return true
  }

  return Array.isArray(block.children) && block.children.some(isReplaceSensitiveBlock)
}

const shouldReplaceEditorDom = (blocks, activeBlocks) => {
  return activeBlocks.some(isReplaceSensitiveBlock) || blocks.some(isReplaceSensitiveBlock)
}

const unwrapSectionHtml = html => html.replace(/^<section>([\s\S]+?)<\/section>$/, '$1')

const replaceDomWithVnode = (rootDom, vnode) => {
  if (!rootDom) {
    return
  }

  rootDom.insertAdjacentHTML('afterend', toHTML(vnode))
  rootDom.remove()
}

const replaceContainerChildren = (rootDom, html) => {
  if (!rootDom) {
    return
  }

  rootDom.innerHTML = html
}

const renderAllBlocks = (stateRender, blocks, activeBlocks, matches) => {
  const children = blocks.map(block => {
    return stateRender.renderBlock(null, block, activeBlocks, matches, true)
  })
  const newVdom = h(`div#${CLASS_OR_ID.AG_EDITOR_ID}`, children)
  const rootDom = getStateRenderEditor(stateRender) || stateRender.container

  if (!rootDom) {
    return
  }

  if (rootDom.nodeType === 1 && rootDom.id !== CLASS_OR_ID.AG_EDITOR_ID) {
    rootDom.id = CLASS_OR_ID.AG_EDITOR_ID
  }

  if (shouldReplaceEditorDom(blocks, activeBlocks)) {
    replaceContainerChildren(rootDom, unwrapSectionHtml(toHTML(h('section', children))))
  } else {
    const oldVdom = toVNode(rootDom)
    patch(oldVdom, newVdom)
  }

  stateRender.flushPendingPreviewRenders()
  stateRender.codeCache.clear()
}

export const renderBlocksToDom = (stateRender, blocks, activeBlocks, matches) => {
  renderAllBlocks(stateRender, blocks, activeBlocks, matches)
}

export const partialRenderBlocksToDom = (stateRender, blocks, activeBlocks, matches, startKey, endKey) => {
  const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1]
  const needRenderCursorBlock = !!cursorOutMostBlock && blocks.indexOf(cursorOutMostBlock) === -1
  const newVnode = h('section', blocks.map(block => stateRender.renderBlock(null, block, activeBlocks, matches)))
  const html = unwrapSectionHtml(toHTML(newVnode))

  const needToRemoved = []
  const editorRoot = getStateRenderEditor(stateRender)
  const firstOldDom = startKey
    ? queryStateRenderEditor(stateRender, `#${startKey}`)
    : editorRoot && editorRoot.firstElementChild
  if (!firstOldDom) {
    renderAllBlocks(stateRender, stateRender.muya.contentState.blocks, activeBlocks, matches)
    return
  }
  needToRemoved.push(firstOldDom)
  let nextSibling = firstOldDom.nextElementSibling
  while (nextSibling && nextSibling.id !== endKey) {
    needToRemoved.push(nextSibling)
    nextSibling = nextSibling.nextElementSibling
  }
  nextSibling && needToRemoved.push(nextSibling)

  firstOldDom.insertAdjacentHTML('beforebegin', html)

  Array.from(needToRemoved).forEach(dom => dom.remove())

  if (needRenderCursorBlock) {
    const { key } = cursorOutMostBlock
    const cursorDom = queryStateRenderEditor(stateRender, `#${key}`)
    if (cursorDom) {
      const newCursorVnode = stateRender.renderBlock(null, cursorOutMostBlock, activeBlocks, matches)
      if (shouldReplaceBlockDom(cursorOutMostBlock)) {
        replaceDomWithVnode(cursorDom, newCursorVnode)
      } else {
        const oldCursorVnode = toVNode(cursorDom)
        patch(oldCursorVnode, newCursorVnode)
      }
    }
  }

  stateRender.flushPendingPreviewRenders()
  stateRender.codeCache.clear()
}

export const singleRenderBlockToDom = (stateRender, block, activeBlocks, matches) => {
  const selector = `#${block.key}`
  const newVdom = stateRender.renderBlock(null, block, activeBlocks, matches, true)
  const rootDom = queryStateRenderEditor(stateRender, selector)
  if (!rootDom) {
    renderAllBlocks(stateRender, stateRender.muya.contentState.blocks, activeBlocks, matches)
    return
  }
  if (shouldReplaceBlockDom(block)) {
    replaceDomWithVnode(rootDom, newVdom)
  } else {
    const oldVdom = toVNode(rootDom)
    patch(oldVdom, newVdom)
  }
  stateRender.flushPendingPreviewRenders()
  stateRender.codeCache.clear()
}
