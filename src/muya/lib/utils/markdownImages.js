import { tokenizer } from '../parser'
import { collectReferenceLabels } from '../parser/referenceLabelSupport'
import { getImageInfo } from '../utils'
import { markdownToState } from './markdownState'

export const extractImagesFromMarkdown = (contentState, markdown) => {
  const results = new Set()
  const blocks = markdownToState(contentState, markdown)
  const labels = collectReferenceLabels(blocks)

  const travelToken = token => {
    const { type, attrs, children, tag, label, backlash } = token
    if (/reference_image|image/.test(type) || type === 'html_tag' && tag === 'img') {
      if ((type === 'image' || type === 'html_tag') && attrs.src) {
        results.add(attrs.src)
      } else {
        const rawSrc = label + backlash.second
        if (labels.has(rawSrc.toLowerCase())) {
          const { href } = labels.get(rawSrc.toLowerCase())
          const { src } = getImageInfo(href)
          if (src) {
            results.add(src)
          }
        }
      }
    } else if (children && children.length) {
      for (const child of children) {
        travelToken(child)
      }
    }
  }

  const travel = block => {
    const { text, children, type, functionType } = block
    if (children.length) {
      for (const b of children) {
        travel(b)
      }
    } else if (text && type === 'span' && /paragraphContent|atxLine|cellContent/.test(functionType)) {
      const tokens = tokenizer(text, [], false, labels)
      for (const token of tokens) {
        travelToken(token)
      }
    }
  }

  for (const block of blocks) {
    travel(block)
  }

  return Array.from(results)
}
