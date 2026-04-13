export const getSpanType = (contentState, block) => {
  let internalType = ''

  if (block.functionType === 'atxLine') {
    internalType = 'heading 1'
  } else if (block.functionType === 'languageInput') {
    internalType = 'pre'
  } else if (block.functionType === 'codeContent') {
    if (block.lang === 'markup') {
      internalType = 'html'
    } else if (block.lang === 'latex') {
      internalType = 'mathblock'
    }

    const rootBlock = contentState.getAnchor(block)
    if (rootBlock && rootBlock.functionType !== 'fencecode') {
      internalType = rootBlock.functionType
    } else {
      internalType = 'pre'
    }
  } else if (block.functionType === 'cellContent') {
    internalType = 'table'
  } else if (block.functionType === 'thematicBreakLine') {
    internalType = 'hr'
  }

  const { affiliation } = contentState.selectionChange(contentState.cursor)
  const listTypes = affiliation
    .slice(0, 3)
    .filter(item => /ul|ol/.test(item.type))
    .map(item => item.listType)

  if (listTypes && listTypes.length === 1) {
    const listType = listTypes[0]
    if (listType === 'bullet') {
      internalType = 'ul-bullet'
    } else if (listType === 'task') {
      internalType = 'ul-task'
    } else if (listType === 'order') {
      internalType = 'ol-order'
    }
  } else if (affiliation.length === 2 && affiliation[1].type === 'blockquote') {
    internalType = 'blockquote'
  } else if (block.functionType === 'paragraphContent') {
    internalType = 'paragraph'
  }

  return internalType
}
