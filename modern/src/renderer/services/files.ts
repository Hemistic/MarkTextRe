import type {
  EditorDocument,
  RecentDocument,
  SaveDocumentInput,
  SaveDocumentResult
} from '@shared/contracts'
import { getMarkTextApi } from './api'

const saveWith = async (
  save: ((input: SaveDocumentInput) => Promise<SaveDocumentResult | null>) | undefined,
  input: SaveDocumentInput
) => {
  if (!save) {
    return null
  }

  return save(input)
}

export const fetchRecentDocuments = async (): Promise<RecentDocument[]> => {
  return getMarkTextApi()?.files.getRecentDocuments() ?? []
}

export const removeRecentDocument = async (pathname: string) => {
  await getMarkTextApi()?.files.removeRecentDocument(pathname)
}

export const openMarkdown = async (): Promise<EditorDocument | null> => {
  return getMarkTextApi()?.files.openMarkdown() ?? null
}

export const openMarkdownAtPath = async (pathname: string): Promise<EditorDocument | null> => {
  return getMarkTextApi()?.files.openMarkdownAtPath(pathname) ?? null
}

export const saveMarkdown = async (input: SaveDocumentInput) => {
  return saveWith(getMarkTextApi()?.files.saveMarkdown, input)
}

export const saveMarkdownAs = async (input: SaveDocumentInput) => {
  return saveWith(getMarkTextApi()?.files.saveMarkdownAs, input)
}
