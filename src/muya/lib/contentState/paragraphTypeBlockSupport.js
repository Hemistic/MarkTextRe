export const getBlockType = block => {
  switch (block.type) {
    case 'div':
      return ''
    case 'figure':
      return block.functionType === 'multiplemath'
        ? 'mathblock'
        : block.functionType
    case 'pre':
      if (block.functionType === 'multiplemath') {
        return 'mathblock'
      } else if (block.functionType === 'fencecode' || block.functionType === 'indentcode') {
        return 'pre'
      } else if (block.functionType === 'frontmatter') {
        return 'front-matter'
      }
      return block.functionType
    case 'ul':
      return block.listType === 'task' ? 'ul-task' : 'ul-bullet'
    case 'ol':
      return 'ol-order'
    case 'li':
      if (block.listItemType === 'order') {
        return 'ol-order'
      } else if (block.listItemType === 'bullet') {
        return 'ul-bullet'
      } else if (block.listItemType === 'task') {
        return 'ul-task'
      }
      return ''
    case 'table':
    case 'th':
    case 'td':
      return 'table'
    default:
      return ''
  }
}
