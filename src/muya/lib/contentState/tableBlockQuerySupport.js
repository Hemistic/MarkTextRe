export const getTableBlock = contentState => {
  const { start, end } = contentState.cursor
  const startBlock = contentState.getBlock(start.key)
  const endBlock = contentState.getBlock(end.key)
  const startParents = contentState.getParents(startBlock)
  const endParents = contentState.getParents(endBlock)
  const affiliation = startParents.filter(parent => endParents.includes(parent))

  if (affiliation.length) {
    return affiliation.find(parent => parent.type === 'figure')
  }
}
