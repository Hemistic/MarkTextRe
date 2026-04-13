const getSequenceTheme = options => options && options.sequenceTheme ? options.sequenceTheme : 'simple'

export const createDiagramOptions = (functionType, options = {}) => {
  if (functionType === 'sequence') {
    return {
      theme: getSequenceTheme(options)
    }
  }

  if (functionType === 'vega-lite') {
    return {
      actions: false,
      ast: true,
      tooltip: false,
      renderer: 'svg',
      theme: options.vegaTheme || 'latimes'
    }
  }

  return {}
}

export const getInvalidDiagramMessage = functionType => {
  switch (functionType) {
    case 'flowchart':
      return 'Flow Chart'
    case 'vega-lite':
      return 'Vega-Lite'
    case 'plantuml':
      return 'PlantUML'
    default:
      return 'Sequence'
  }
}

export const renderDiagramByType = async (render, target, functionType, code, options = {}) => {
  if (functionType === 'flowchart' || functionType === 'sequence') {
    const diagram = render.parse(code)
    target.innerHTML = ''
    diagram.drawSVG(target, options)
    return
  }

  if (functionType === 'plantuml') {
    const diagram = render.parse(code)
    target.innerHTML = ''
    diagram.insertImgElement(target)
    return
  }

  if (functionType === 'vega-lite') {
    target.innerHTML = ''
    await render(target, JSON.parse(code), options)
  }
}
