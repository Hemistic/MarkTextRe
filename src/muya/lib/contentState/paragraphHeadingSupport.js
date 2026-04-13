import { DEFAULT_TURNDOWN_CONFIG } from '../config'

const getCurrentLevel = type => {
  if (/\d/.test(type)) {
    return Number(/\d/.exec(type)[0])
  } else {
    return 0
  }
}

export const updateHeadingOrParagraph = (contentState, paraType, block) => {
  const { start, end } = contentState.cursor
  if (start.key !== end.key) {
    return false
  }

  const { text, type } = block
  const headingStyle = DEFAULT_TURNDOWN_CONFIG.headingStyle
  const parent = contentState.getParent(block)
  const [, hash, partText] = /(^ {0,3}#*[ \u00A0]*)([\s\S]*)/.exec(text)
  let newLevel = 0
  let newType = 'p'
  let key

  if (/\d/.test(paraType)) {
    newLevel = Number(paraType.split(/\s/)[1])
    newType = `h${newLevel}`
  } else if (paraType === 'upgrade heading' || paraType === 'degrade heading') {
    const currentLevel = getCurrentLevel(parent.type)
    newLevel = currentLevel
    if (paraType === 'upgrade heading' && currentLevel !== 1) {
      if (currentLevel === 0) newLevel = 6
      else newLevel = currentLevel - 1
    } else if (paraType === 'degrade heading' && currentLevel !== 0) {
      if (currentLevel === 6) newLevel = 0
      else newLevel = currentLevel + 1
    }
    newType = newLevel === 0 ? 'p' : `h${newLevel}`
  }

  const startOffset = newLevel > 0
    ? start.offset + newLevel - hash.length + 1
    : start.offset - hash.length
  const endOffset = newLevel > 0
    ? end.offset + newLevel - hash.length + 1
    : end.offset - hash.length
  let newText = newLevel > 0
    ? '#'.repeat(newLevel) + `${String.fromCharCode(160)}${partText}`
    : partText

  if (type === 'span' && block.functionType === 'thematicBreakLine') {
    newText = ''
  }

  if (newType === 'p' && parent.type === newType) {
    return false
  }
  if (newType !== 'p' && parent.type === newType && parent.headingStyle === headingStyle) {
    return false
  }

  if (newType !== 'p') {
    const header = contentState.createBlock(newType, {
      headingStyle
    })
    const headerContent = contentState.createBlock('span', {
      text: headingStyle === 'atx' ? newText.replace(/\n/g, ' ') : newText,
      functionType: headingStyle === 'atx' ? 'atxLine' : 'paragraphContent'
    })
    contentState.appendChild(header, headerContent)
    key = headerContent.key

    contentState.insertBefore(header, parent)
    contentState.removeBlock(parent)
  } else {
    const pBlock = contentState.createBlockP(newText)
    key = pBlock.children[0].key
    contentState.insertAfter(pBlock, parent)
    contentState.removeBlock(parent)
  }

  contentState.cursor = {
    start: { key, offset: startOffset },
    end: { key, offset: endOffset }
  }

  return true
}
