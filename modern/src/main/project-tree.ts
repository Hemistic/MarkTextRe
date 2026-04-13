import path from 'node:path'
import { promises as fs } from 'node:fs'
import type { Dirent } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { ProjectTreeNode } from '@shared/contracts'

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd', '.txt'])

const compareByName = (left: { name: string }, right: { name: string }) => {
  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
}

const createRootName = (pathname: string) => {
  const baseName = path.basename(pathname)
  return baseName || pathname
}

const isMarkdownFile = (pathname: string) => {
  return MARKDOWN_EXTENSIONS.has(path.extname(pathname).toLowerCase())
}

const createTimestampFields = (stats: Awaited<ReturnType<typeof fs.stat>>) => ({
  createdAtMs: Number(stats.birthtimeMs),
  modifiedAtMs: Number(stats.mtimeMs)
})

const buildNodeFromDirectoryEntry = async (parentPath: string, entry: Dirent): Promise<ProjectTreeNode | null> => {
  const pathname = path.join(parentPath, entry.name)

  if (entry.isDirectory()) {
    const stats = await fs.stat(pathname)
    return buildProjectTree(pathname, {
      name: entry.name,
      stats
    })
  }

  if (!entry.isFile()) {
    return null
  }

  const stats = await fs.stat(pathname)

  return {
    id: randomUUID(),
    pathname,
    name: entry.name,
    isDirectory: false,
    isFile: true,
    isMarkdown: isMarkdownFile(pathname),
    ...createTimestampFields(stats)
  }
}

export const buildProjectTree = async (
  pathname: string,
  options?: {
    name?: string
    stats?: Awaited<ReturnType<typeof fs.stat>>
  }
): Promise<ProjectTreeNode> => {
  const stats = options?.stats ?? await fs.stat(pathname)
  const entries = await fs.readdir(pathname, { withFileTypes: true })
  const children = await Promise.all(entries.map(entry => buildNodeFromDirectoryEntry(pathname, entry)))
  const filteredChildren = children.filter((child): child is ProjectTreeNode => child !== null)

  const folders = filteredChildren
    .filter(child => child.isDirectory)
    .sort(compareByName)
  const files = filteredChildren
    .filter(child => child.isFile)
    .sort(compareByName)

  return {
    id: randomUUID(),
    pathname,
    name: options?.name ?? createRootName(pathname),
    isDirectory: true,
    isFile: false,
    isMarkdown: false,
    ...createTimestampFields(stats),
    isCollapsed: false,
    folders,
    files
  }
}
