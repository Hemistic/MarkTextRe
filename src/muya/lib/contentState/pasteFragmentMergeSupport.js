import { HAS_TEXT_BLOCK_REG } from '../config'

export const getLastFragmentBlock = blocks => {
  const len = blocks.length
  const lastBlock = blocks[len - 1]

  if (lastBlock.children.length === 0 && HAS_TEXT_BLOCK_REG.test(lastBlock.type)) {
    return lastBlock
  } else if (lastBlock.editable === false) {
    return getLastFragmentBlock(blocks[len - 2].children)
  } else {
    return getLastFragmentBlock(lastBlock.children)
  }
}

export const mergeListFragments = (contentState, startBlock, parent, firstFragment, tailFragments) => {
  const listItems = firstFragment.children
  const firstListItem = listItems[0]
  const liChildren = firstListItem.children
  const originListItem = contentState.getParent(parent)
  const originList = contentState.getParent(originListItem)
  const targetListType = firstFragment.children[0].isLooseListItem
  const originListType = originList.children[0].isLooseListItem

  if (targetListType !== originListType) {
    if (!targetListType) {
      firstFragment.children.forEach(item => (item.isLooseListItem = true))
    } else {
      originList.children.forEach(item => (item.isLooseListItem = true))
    }
  }

  if (liChildren[0].type === 'p') {
    startBlock.text += liChildren[0].children[0].text
    const tail = liChildren.slice(1)
    if (tail.length) {
      tail.forEach(block => {
        contentState.appendChild(originListItem, block)
      })
    }
    const firstFragmentTail = listItems.slice(1)
    if (firstFragmentTail.length) {
      firstFragmentTail.forEach(block => {
        contentState.appendChild(originList, block)
      })
    }
  } else {
    listItems.forEach(block => {
      contentState.appendChild(originList, block)
    })
  }

  let target = originList
  tailFragments.forEach(block => {
    contentState.insertAfter(block, target)
    target = block
  })
}

export const mergeParagraphFragments = (contentState, startBlock, parent, firstFragment, tailFragments) => {
  const text = firstFragment.children[0].text
  const lines = text.split('\n')
  let target = parent
  if (parent.headingStyle === 'atx') {
    startBlock.text += lines[0]
    if (lines.length > 1) {
      const pBlock = contentState.createBlockP(lines.slice(1).join('\n'))
      contentState.insertAfter(pBlock, parent)
      target = pBlock
    }
  } else {
    startBlock.text += text
  }

  tailFragments.forEach(block => {
    contentState.insertAfter(block, target)
    target = block
  })
}
