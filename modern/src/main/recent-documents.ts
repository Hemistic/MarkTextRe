import path from 'node:path'
import { promises as fs } from 'node:fs'
import type { RecentDocument } from '@shared/contracts'
import { recentDocumentsPath } from './paths'

export const readRecentDocuments = async (): Promise<RecentDocument[]> => {
  try {
    const raw = await fs.readFile(recentDocumentsPath(), 'utf8')
    const parsed = JSON.parse(raw) as RecentDocument[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(item => typeof item?.pathname === 'string' && typeof item?.filename === 'string')
  } catch {
    return []
  }
}

export const writeRecentDocuments = async (recentDocuments: RecentDocument[]) => {
  await fs.mkdir(path.dirname(recentDocumentsPath()), { recursive: true })
  await fs.writeFile(recentDocumentsPath(), JSON.stringify(recentDocuments, null, 2), 'utf8')
}

export const updateRecentDocuments = async (pathname: string) => {
  const nextItem: RecentDocument = {
    pathname,
    filename: path.basename(pathname)
  }
  const recentDocuments = await readRecentDocuments()
  const nextDocuments = [
    nextItem,
    ...recentDocuments.filter(item => item.pathname !== pathname)
  ].slice(0, 8)

  await writeRecentDocuments(nextDocuments)
}

export const removeRecentDocument = async (pathname: string) => {
  const recentDocuments = await readRecentDocuments()
  const nextDocuments = recentDocuments.filter(item => item.pathname !== pathname)
  await writeRecentDocuments(nextDocuments)
}

export const clearRecentDocuments = async () => {
  await writeRecentDocuments([])
}
