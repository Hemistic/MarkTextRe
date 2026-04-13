import { CLASS_OR_ID } from '../../../config'
import { renderTableTools } from './renderToolBar'
import { footnoteJumpIcon } from './renderFootnoteJump'
import renderCopyButton from './renderCopyButton'
import { renderLeftBar, renderBottomBar } from './renderTableDargBar'

const PRE_BLOCK_HASH = {
  fencecode: `.${CLASS_OR_ID.AG_FENCE_CODE}`,
  indentcode: `.${CLASS_OR_ID.AG_INDENT_CODE}`,
  html: `.${CLASS_OR_ID.AG_HTML_BLOCK}`,
  frontmatter: `.${CLASS_OR_ID.AG_FRONT_MATTER}`,
  multiplemath: `.${CLASS_OR_ID.AG_MULTIPLE_MATH}`,
  flowchart: `.${CLASS_OR_ID.AG_FLOWCHART}`,
  sequence: `.${CLASS_OR_ID.AG_SEQUENCE}`,
  plantuml: `.${CLASS_OR_ID.AG_PLANTUML}`,
  mermaid: `.${CLASS_OR_ID.AG_MERMAID}`,
  'vega-lite': `.${CLASS_OR_ID.AG_VEGA_LITE}`
}

export const updateRenderingContext = (stateRender, block) => {
  if (block.type === 'table') {
    stateRender.renderingTable = block
  } else if (/thead|tbody/.test(block.type)) {
    stateRender.renderingRowContainer = block
  }
}

export const applyEditableState = (data, editable) => {
  if (editable === false) {
    Object.assign(data.attrs, {
      contenteditable: 'false',
      spellcheck: 'false'
    })
  }
}

export const decorateCodeContainer = (stateRender, selector, data, children, block, parent) => {
  let nextSelector = selector

  if (/code|pre/.test(block.type)) {
    if (typeof block.lang === 'string' && !!block.lang) {
      nextSelector += `.language-${block.lang.replace(/[#.]{1}/g, '')}`
    }
    const isPreviewEditorBlock = block.type === 'pre' && parent && parent.type === 'figure'
    if (block.type === 'pre' && !isPreviewEditorBlock) {
      children.unshift(renderCopyButton())
    }
    Object.assign(data.attrs, { spellcheck: 'false' })
  }

  return nextSelector
}

export const decorateTableCell = (stateRender, selector, data, children, block, activeBlocks, parent) => {
  let nextSelector = selector
  const { cells } = stateRender.muya.contentState.selectedTableCells || {}

  if (block.align) {
    Object.assign(data.attrs, {
      style: `text-align:${block.align}`
    })
  }

  if (typeof block.column === 'number') {
    Object.assign(data.dataset, {
      column: block.column
    })
  }

  if (cells && cells.length) {
    const cell = cells.find(item => item.key === block.key)
    if (cell) {
      const { top, right, bottom, left } = cell
      nextSelector += '.ag-cell-selected'
      if (top) nextSelector += '.ag-cell-border-top'
      if (right) nextSelector += '.ag-cell-border-right'
      if (bottom) nextSelector += '.ag-cell-border-bottom'
      if (left) nextSelector += '.ag-cell-border-left'
    }
    return nextSelector
  }

  const { renderingTable, renderingRowContainer } = stateRender
  const findTable = renderingTable ? activeBlocks.find(item => item.key === renderingTable.key) : null
  if (findTable && renderingRowContainer) {
    const { row: tableRow, column: tableColumn } = findTable
    const isLastRow = () => {
      if (renderingRowContainer.type === 'thead') {
        return tableRow === 0
      } else {
        return !parent.nextSibling
      }
    }
    if (block.parent === activeBlocks[1].parent && !block.preSibling && tableRow > 0) {
      children.unshift(renderLeftBar())
    }

    if (block.column === activeBlocks[1].column && isLastRow() && tableColumn > 0) {
      children.push(renderBottomBar())
    }
  }

  return nextSelector
}

export const decorateHeadingBlock = (selector, data, block) => {
  let nextSelector = selector

  if (/^h\d$/.test(block.type)) {
    Object.assign(data.dataset, {
      head: block.type
    })
    nextSelector += `.${block.headingStyle}`
  }
  Object.assign(data.dataset, {
    role: block.type
  })

  return nextSelector
}

export const decorateFigureBlock = (stateRender, selector, data, children, block, activeBlocks) => {
  let nextSelector = selector

  if (block.functionType) {
    Object.assign(data.dataset, { role: block.functionType.toUpperCase() })
    if (block.functionType === 'table' && activeBlocks[0] && activeBlocks[0].functionType === 'cellContent') {
      children.unshift(renderTableTools(activeBlocks))
    } else if (block.functionType === 'footnote') {
      children.push(footnoteJumpIcon())
    }
  }

  if (/html|multiplemath|flowchart|mermaid|sequence|plantuml|vega-lite/.test(block.functionType)) {
    nextSelector += `.${CLASS_OR_ID.AG_CONTAINER_BLOCK}`
    Object.assign(data.attrs, { spellcheck: 'false' })
  }

  return nextSelector
}

export const decorateListBlock = (selector, data, block) => {
  let nextSelector = selector

  if (/ul|ol/.test(block.type) && block.listType) {
    nextSelector += `.ag-${block.listType}-list`
    if (block.type === 'ol') {
      Object.assign(data.attrs, { start: block.start })
    }
  } else if (block.type === 'li' && block.listItemType) {
    Object.assign(data.dataset, { marker: block.bulletMarkerOrDelimiter })
    nextSelector += `.${CLASS_OR_ID.AG_LIST_ITEM}`
    nextSelector += `.ag-${block.listItemType}-list-item`
    nextSelector += block.isLooseListItem ? `.${CLASS_OR_ID.AG_LOOSE_LIST_ITEM}` : `.${CLASS_OR_ID.AG_TIGHT_LIST_ITEM}`
  }

  return nextSelector
}

export const decoratePreBlock = (stateRender, selector, data, block) => {
  let nextSelector = selector

  Object.assign(data.attrs, { spellcheck: 'false' })
  Object.assign(data.dataset, { role: block.functionType })
  nextSelector += PRE_BLOCK_HASH[block.functionType]

  if (/html|multiplemath|mermaid|flowchart|vega-lite|sequence|plantuml/.test(block.functionType)) {
    const codeBlock = block.children[0]
    const code = codeBlock.children.map(line => line.text).join('\n')
    stateRender.codeCache.set(block.key, code)
  }

  return nextSelector
}
