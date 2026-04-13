import { getBlockType } from './paragraphTypeBlockSupport'
import { getSpanType } from './paragraphTypeSpanSupport'

export const getTypeFromBlock = (contentState, block) => {
  const { type } = block

  let internalType = ''
  const headingMatch = type.match(/^h([1-6]{1})$/)
  if (headingMatch && headingMatch[1]) {
    internalType = `heading ${headingMatch[1]}`
  }

  switch (type) {
    case 'span':
      internalType = getSpanType(contentState, block)
      break
    default:
      internalType = getBlockType(block)
      break
  }

  return internalType
}
