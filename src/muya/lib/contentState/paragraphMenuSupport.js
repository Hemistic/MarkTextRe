import { normalizeParagraphType, updateHeadingOrParagraph, insertHorizontalRule } from './paragraphStyleTransforms'
import { handleFrontMatter, handleListMenu, handleLooseListItem, handleQuoteMenu, showTablePicker } from './paragraphStructureMenuSupport'
import { dispatchContentStateSelectionAndChange } from './runtimeEventSupport'

export { selectionChange, getCommonParent } from './paragraphSelectionSupport'
export { handleFrontMatter, handleListMenu, handleLooseListItem, handleQuoteMenu, showTablePicker } from './paragraphStructureMenuSupport'

export const updateParagraph = (contentState, paraType, insertMode = false) => {
  const { start, end } = contentState.cursor
  const block = contentState.getBlock(start.key)
  let needDispatchChange = true

  if (!contentState.isAllowedTransformation(block, paraType, start.key !== end.key)) {
    return
  }

  paraType = normalizeParagraphType(contentState, paraType, block)
  if (!paraType) {
    return
  }

  switch (paraType) {
    case 'front-matter':
      handleFrontMatter(contentState)
      break
    case 'ul-bullet':
    case 'ul-task':
    case 'ol-order':
      needDispatchChange = handleListMenu(contentState, paraType, insertMode)
      break
    case 'loose-list-item':
      handleLooseListItem(contentState)
      break
    case 'pre':
      contentState.handleCodeBlockMenu()
      break
    case 'blockquote':
      handleQuoteMenu(contentState, insertMode)
      break
    case 'mathblock':
      contentState.insertContainerBlock('multiplemath', block)
      break
    case 'table':
      showTablePicker(contentState)
      break
    case 'html':
      contentState.insertHtmlBlock(block)
      break
    case 'flowchart':
    case 'sequence':
    case 'plantuml':
    case 'mermaid':
    case 'vega-lite':
      contentState.insertContainerBlock(paraType, block)
      break
    case 'heading 1':
    case 'heading 2':
    case 'heading 3':
    case 'heading 4':
    case 'heading 5':
    case 'heading 6':
    case 'upgrade heading':
    case 'degrade heading':
    case 'paragraph':
      if (!updateHeadingOrParagraph(contentState, paraType, block)) {
        return
      }
      break
    case 'hr':
      insertHorizontalRule(contentState, block)
      break
  }

  if (paraType === 'front-matter' || paraType === 'pre') {
    contentState.render()
  } else {
    contentState.partialRender()
  }

  if (needDispatchChange) {
    dispatchContentStateSelectionAndChange(contentState)
  }
}
