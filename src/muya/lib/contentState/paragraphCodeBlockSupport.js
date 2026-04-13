
import {
  multiParagraphToCodeBlock,
  singleParagraphToCodeBlock
} from './paragraphCodeBlockCreateSupport'
import { codeBlockToParagraphs } from './paragraphCodeBlockRestoreSupport'

export const handleCodeBlockMenu = contentState => {
  const { start, end, affiliation } = contentState.selectionChange(contentState.cursor)
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const hasFencedCodeBlockParent = () => {
    return [...startParents, ...endParents].some(block => block.type === 'pre' && /code/.test(block.functionType))
  }

  if (affiliation.length && affiliation[0].type === 'pre' && /code/.test(affiliation[0].functionType)) {
    return codeBlockToParagraphs(contentState, affiliation[0])
  }

  if (start.key === end.key) {
    return singleParagraphToCodeBlock(contentState, startBlock)
  }

  if (!hasFencedCodeBlockParent()) {
    const { parent, startIndex, endIndex } = contentState.getCommonParent()
    return multiParagraphToCodeBlock(contentState, parent, startIndex, endIndex)
  }
}
