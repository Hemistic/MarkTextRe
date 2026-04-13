import type {
  EditorDocument,
  LocalImageProcessInput,
  OpenPathSelection,
  ProjectTreeNode,
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

export const pickOpenPaths = async (): Promise<OpenPathSelection[]> => {
  return invokeFilesAction((files) => files.pickOpenPaths(), [])
}

export const openMarkdown = async (): Promise<EditorDocument | null> => {
  return invokeFilesAction((files) => files.openMarkdown(), null)
}

export const openMarkdownInNewWindow = async (): Promise<boolean> => {
  return invokeFilesAction((files) => files.openMarkdownInNewWindow(), false)
}

export const openMarkdownAtPath = async (pathname: string): Promise<EditorDocument | null> => {
  return invokeFilesAction((files) => files.openMarkdownAtPath(pathname), null)
}

export const openMarkdownAtPathInNewWindow = async (pathname: string): Promise<boolean> => {
  return invokeFilesAction((files) => files.openMarkdownAtPathInNewWindow(pathname), false)
}

export const openFolder = async (): Promise<ProjectTreeNode | null> => {
  return invokeFilesAction((files) => files.openFolder(), null)
}

export const openFolderAtPath = async (pathname: string): Promise<ProjectTreeNode | null> => {
  return invokeFilesAction((files) => files.openFolderAtPath(pathname), null)
}

export const openFolderInNewWindow = async (): Promise<boolean> => {
  return invokeFilesAction((files) => files.openFolderInNewWindow(), false)
}

export const openFolderAtPathInNewWindow = async (pathname: string): Promise<boolean> => {
  return invokeFilesAction((files) => files.openFolderAtPathInNewWindow(pathname), false)
}

export const pickImagePath = async (): Promise<string | null> => {
  return invokeFilesAction((files) => files.pickImage(), null)
}

export const processLocalImagePath = async (input: LocalImageProcessInput): Promise<string | null> => {
  return invokeFilesAction((files) => files.processLocalImage(input), null)
}

export const saveMarkdown = async (input: SaveDocumentInput) => {
  return invokeFilesAction((files) => files.saveMarkdown(input), null)
}

export const saveMarkdownAs = async (input: SaveDocumentInput) => {
  return invokeFilesAction((files) => files.saveMarkdownAs(input), null)
}
