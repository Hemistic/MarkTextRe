import { getUniqueId, deepCopy } from '../utils'
import escapeCharactersMap, { escapeCharacters } from '../parser/escapeCharacter'

export const createBlock = (type = 'span', extras = {}) => {
  const key = getUniqueId()
  const blockData = {
    key,
    text: '',
    type,
    editable: true,
    parent: null,
    preSibling: null,
    nextSibling: null,
    children: []
  }

  if (type === 'span' && !extras.functionType) {
    blockData.functionType = 'paragraphContent'
  }

  if (extras.functionType === 'codeContent' && extras.text) {
    const CHAR_REG = new RegExp(`(${escapeCharacters.join('|')})`, 'gi')
    extras.text = extras.text.replace(CHAR_REG, (_, p) => {
      return escapeCharactersMap[p]
    })
  }

  Object.assign(blockData, extras)
  return blockData
}

export const createBlockP = (contentState, text = '') => {
  const pBlock = contentState.createBlock('p')
  const contentBlock = contentState.createBlock('span', { text })
  contentState.appendChild(pBlock, contentBlock)
  return pBlock
}

export const copyBlock = (contentState, origin) => {
  const copiedBlock = deepCopy(origin)
  const travel = (block, parent, preBlock, nextBlock) => {
    const key = getUniqueId()
    block.key = key
    block.parent = parent ? parent.key : null
    block.preSibling = preBlock ? preBlock.key : null
    block.nextSibling = nextBlock ? nextBlock.key : null
    const { children } = block
    const len = children.length
    if (children && len) {
      for (let i = 0; i < len; i++) {
        const child = children[i]
        const preChild = i >= 1 ? children[i - 1] : null
        const nextChild = i < len - 1 ? children[i + 1] : null
        travel(child, block, preChild, nextChild)
      }
    }
  }

  travel(copiedBlock, null, null, null)
  return copiedBlock
}
