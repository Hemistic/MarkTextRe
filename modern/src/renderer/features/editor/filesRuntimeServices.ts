import {
  openMarkdown,
  openMarkdownAtPath,
  saveMarkdown,
  saveMarkdownAs
} from '../../services/files'

export interface EditorFilesRuntimeServices {
  openMarkdown: typeof openMarkdown
  openMarkdownAtPath: typeof openMarkdownAtPath
  saveMarkdown: typeof saveMarkdown
  saveMarkdownAs: typeof saveMarkdownAs
}

export const createEditorFilesRuntimeServices = (): EditorFilesRuntimeServices => ({
  openMarkdown,
  openMarkdownAtPath,
  saveMarkdown,
  saveMarkdownAs
})
