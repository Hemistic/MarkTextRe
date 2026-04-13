import type {
  EditorDocument,
  RecentDocument,
  SaveDocumentInput,
  SaveDocumentResult
} from '@shared/contracts'
import { invokeFilesAction, invokeFilesNotification } from './fileApi'

export const fetchRecentDocuments = async (): Promise<RecentDocument[]> => {
  return invokeFilesAction((files) => files.getRecentDocuments(), [])
}

export const removeRecentDocument = async (pathname: string) => {
  await invokeFilesNotification((files) => files.removeRecentDocument(pathname))
}

export const openMarkdown = async (): Promise<EditorDocument | null> => {
  return invokeFilesAction((files) => files.openMarkdown(), null)
}

export const openMarkdownAtPath = async (pathname: string): Promise<EditorDocument | null> => {
  return invokeFilesAction((files) => files.openMarkdownAtPath(pathname), null)
}

export const saveMarkdown = async (input: SaveDocumentInput) => {
  return invokeFilesAction((files) => files.saveMarkdown(input), null)
}

export const saveMarkdownAs = async (input: SaveDocumentInput) => {
  return invokeFilesAction((files) => files.saveMarkdownAs(input), null)
}
