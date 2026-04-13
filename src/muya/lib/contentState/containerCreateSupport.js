const FUNCTION_TYPE_LANG = {
  multiplemath: 'latex',
  flowchart: 'yaml',
  mermaid: 'yaml',
  sequence: 'yaml',
  plantuml: 'yaml',
  'vega-lite': 'yaml',
  html: 'markup'
}

const applyMathStyle = (contentState, block, functionType, style) => {
  if (functionType === 'multiplemath') {
    if (style === undefined) {
      block.mathStyle = contentState.isGitlabCompatibilityEnabled ? 'gitlab' : ''
    }
    block.mathStyle = style
  }
}

export const createPreAndPreview = (contentState, functionType, value = '') => {
  const lang = FUNCTION_TYPE_LANG[functionType]
  const preBlock = contentState.createBlock('pre', {
    functionType,
    lang
  })
  const codeBlock = contentState.createBlock('code', {
    lang
  })

  contentState.appendChild(preBlock, codeBlock)

  if (typeof value === 'string' && value) {
    value = value.replace(/^\s+/, '')
    const codeContent = contentState.createBlock('span', {
      text: value,
      lang,
      functionType: 'codeContent'
    })
    contentState.appendChild(codeBlock, codeContent)
  } else {
    const emptyCodeContent = contentState.createBlock('span', {
      functionType: 'codeContent',
      lang
    })

    contentState.appendChild(codeBlock, emptyCodeContent)
  }

  const preview = contentState.createBlock('div', {
    editable: false,
    functionType
  })

  return { preBlock, preview }
}

export const createContainerBlock = (contentState, functionType, value = '', style = undefined) => {
  const figureBlock = contentState.createBlock('figure', {
    functionType
  })

  applyMathStyle(contentState, figureBlock, functionType, style)

  const { preBlock, preview } = createPreAndPreview(contentState, functionType, value)
  contentState.appendChild(figureBlock, preBlock)
  contentState.appendChild(figureBlock, preview)
  return figureBlock
}

export const initContainerBlock = (contentState, functionType, block, style = undefined) => {
  block.type = 'figure'
  block.functionType = functionType
  block.children = []

  applyMathStyle(contentState, block, functionType, style)

  const { preBlock, preview } = createPreAndPreview(contentState, functionType)

  contentState.appendChild(block, preBlock)
  contentState.appendChild(block, preview)
  return preBlock.children[0].children[0]
}
