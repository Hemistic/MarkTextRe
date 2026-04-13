
export const applyInlineDegrade = (contentState, block, parent, inlineDegrade) => {
  if (block.type === 'span') {
    block = contentState.getParent(block)
    parent = contentState.getParent(parent)
  }

  switch (inlineDegrade.type) {
    case 'STOP':
      break
    case 'LI': {
      if (inlineDegrade.info === 'REPLACEMENT') {
        const children = parent.children
        const grandpa = contentState.getBlock(parent.parent)
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.insertBefore(child, grandpa)
        })
        contentState.removeBlock(grandpa)
      } else if (inlineDegrade.info === 'REMOVE_INSERT_BEFORE') {
        const children = parent.children
        const grandpa = contentState.getBlock(parent.parent)
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.insertBefore(child, grandpa)
        })
        contentState.removeBlock(parent)
      } else if (inlineDegrade.info === 'INSERT_PRE_LIST_ITEM') {
        const parPre = contentState.getBlock(parent.preSibling)
        const children = parent.children
        if (children[0].type === 'input') {
          contentState.removeBlock(children[0])
        }
        children.forEach(child => {
          contentState.appendChild(parPre, child)
        })
        contentState.removeBlock(parent)
      }
      break
    }
    case 'BLOCKQUOTE':
      if (inlineDegrade.info === 'REPLACEMENT') {
        contentState.insertBefore(block, parent)
        contentState.removeBlock(parent)
      } else if (inlineDegrade.info === 'INSERT_BEFORE') {
        contentState.removeBlock(block)
        contentState.insertBefore(block, parent)
      }
      break
  }

  const key = block.type === 'p' ? block.children[0].key : block.key
  const offset = 0
  contentState.cursor = {
    start: { key, offset },
    end: { key, offset }
  }

  if (inlineDegrade.type !== 'STOP') {
    contentState.partialRender()
  }
}
