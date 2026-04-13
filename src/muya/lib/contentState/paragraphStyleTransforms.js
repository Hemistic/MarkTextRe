export const normalizeParagraphType = (contentState, paraType, block) => {
  if (paraType !== 'reset-to-paragraph') {
    return paraType
  }

  const blockType = contentState.getTypeFromBlock(block)
  if (!blockType || blockType === 'table') {
    return null
  }

  return /heading|hr/.test(blockType) ? 'paragraph' : blockType
}
export { updateHeadingOrParagraph } from './paragraphHeadingSupport'
export { insertHorizontalRule } from './paragraphHrSupport'
