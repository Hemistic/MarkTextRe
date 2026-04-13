import 'flowchart.js/src/flowchart.shim.js'
import parseModule from 'flowchart.js/src/flowchart.parse.js'

type FlowchartParse = typeof parseModule

const parse = (parseModule as FlowchartParse & { default?: FlowchartParse }).default ?? parseModule
const FlowChart = { parse }

if (typeof window !== 'undefined') {
  ;(window as Window & { flowchart?: typeof FlowChart }).flowchart = FlowChart
}

export default FlowChart
