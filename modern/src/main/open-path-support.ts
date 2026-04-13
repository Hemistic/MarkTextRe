import path from 'node:path'

export const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd', '.txt'])

export const enqueueUniquePath = (pendingOpenPaths: string[], pathname: string) => {
  if (!pendingOpenPaths.includes(pathname)) {
    pendingOpenPaths.push(pathname)
  }
}

export const isMarkdownPath = (pathname: string) => {
  return MARKDOWN_EXTENSIONS.has(path.extname(pathname).toLowerCase())
}

interface NormalizeOpenablePathDependencies {
  pathResolver?: (candidate: string) => string
  statPath: (pathname: string) => Promise<{ isFile: () => boolean }>
}

export const normalizeOpenablePath = async (
  candidate: string,
  {
    pathResolver = path.resolve,
    statPath
  }: NormalizeOpenablePathDependencies
) => {
  if (!candidate || candidate.startsWith('-')) {
    return null
  }

  const normalizedPath = pathResolver(candidate)
  if (!isMarkdownPath(normalizedPath)) {
    return null
  }

  try {
    const stat = await statPath(normalizedPath)
    return stat.isFile() ? normalizedPath : null
  } catch {
    return null
  }
}

interface ExtractOpenablePathsDependencies extends NormalizeOpenablePathDependencies {}

export const extractOpenablePaths = async (
  argv: string[],
  dependencies: ExtractOpenablePathsDependencies
) => {
  const resolved = await Promise.all(
    argv.map(argument => normalizeOpenablePath(argument, dependencies))
  )

  return resolved.filter((pathname): pathname is string => Boolean(pathname))
}
