import mermaidModule from 'mermaid'

const mermaid = (mermaidModule as typeof mermaidModule & { default?: typeof mermaidModule }).default ?? mermaidModule

export default mermaid
