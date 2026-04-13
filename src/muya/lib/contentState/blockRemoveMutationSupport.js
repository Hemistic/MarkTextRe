export const removeBlock = (contentState, block, fromBlocks = contentState.blocks) => {
  const remove = (blocks, targetBlock) => {
    const len = blocks.length
    for (let i = 0; i < len; i++) {
      if (blocks[i].key === targetBlock.key) {
        const preSibling = contentState.getBlock(targetBlock.preSibling)
        const nextSibling = contentState.getBlock(targetBlock.nextSibling)

        if (preSibling) {
          preSibling.nextSibling = nextSibling ? nextSibling.key : null
        }
        if (nextSibling) {
          nextSibling.preSibling = preSibling ? preSibling.key : null
        }

        return blocks.splice(i, 1)
      } else if (blocks[i].children.length) {
        remove(blocks[i].children, targetBlock)
      }
    }
  }

  remove(Array.isArray(fromBlocks) ? fromBlocks : fromBlocks.children, block)
}
