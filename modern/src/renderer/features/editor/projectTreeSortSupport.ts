import type { FileSortBy, ProjectTreeNode } from '@shared/contracts'

const compareByName = (left: { name: string }, right: { name: string }) => {
  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
}

const getTimestamp = (node: ProjectTreeNode, sortBy: FileSortBy) => {
  return sortBy === 'created'
    ? node.createdAtMs ?? 0
    : node.modifiedAtMs ?? 0
}

const compareFiles = (sortBy: FileSortBy) => {
  if (sortBy === 'title') {
    return compareByName
  }

  return (left: ProjectTreeNode, right: ProjectTreeNode) => {
    const timestampDelta = getTimestamp(right, sortBy) - getTimestamp(left, sortBy)
    if (timestampDelta !== 0) {
      return timestampDelta
    }

    return compareByName(left, right)
  }
}

export const sortProjectTree = (node: ProjectTreeNode, sortBy: FileSortBy) => {
  if (!node.isDirectory) {
    return node
  }

  node.folders?.sort(compareByName)
  node.files?.sort(compareFiles(sortBy))
  node.folders?.forEach(folder => sortProjectTree(folder, sortBy))

  return node
}
