import { beginRules } from './rules'

export const collectReferenceLabels = blocks => {
  const labels = new Map()

  const travel = block => {
    const { text, children } = block
    if (children && children.length) {
      children.forEach(c => travel(c))
    } else if (text) {
      const tokens = beginRules.reference_definition.exec(text)
      if (tokens) {
        const key = (tokens[2] + tokens[3]).toLowerCase()
        if (!labels.has(key)) {
          labels.set(key, {
            href: tokens[6],
            title: tokens[10] || ''
          })
        }
      }
    }
  }

  blocks.forEach(block => travel(block))
  return labels
}
