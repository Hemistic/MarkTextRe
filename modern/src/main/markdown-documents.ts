import path from 'node:path'
import { promises as fs } from 'node:fs'
import type {
  EditorDocument,
  SaveDocumentResult
} from '@shared/contracts'
import { updateRecentDocuments } from './recent-documents'

const createDocument = (pathname: string, markdown: string): EditorDocument => ({
  id: pathname,
  pathname,
  filename: path.basename(pathname),
  markdown,
  dirty: false
})

export const openMarkdownDocument = async (pathname: string) => {
  const markdown = await fs.readFile(pathname, 'utf8')
  await updateRecentDocuments(pathname)
  return createDocument(pathname, markdown)
}

export const tryOpenMarkdownDocument = async (pathname: string) => {
  try {
    return await openMarkdownDocument(pathname)
  } catch {
    return null
  }
}

export const saveMarkdownDocument = async (
  pathname: string,
  markdown: string
): Promise<SaveDocumentResult> => {
  await fs.writeFile(pathname, markdown, 'utf8')
  await updateRecentDocuments(pathname)

  return {
    pathname,
    filename: path.basename(pathname)
  }
}
