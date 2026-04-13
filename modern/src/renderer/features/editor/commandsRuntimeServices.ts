import { confirmCloseDocument } from '../../services/appCommands'
import { hasMarkTextBridge } from '../../services/api'
import {
  openMarkdown,
  openMarkdownAtPath,
  removeRecentDocument,
  saveMarkdown,
  saveMarkdownAs
} from '../../services/files'

export interface EditorCommandsRuntimeServices {
  bridgeAvailable: () => boolean
  confirmCloseDocument: typeof confirmCloseDocument
  openMarkdown: typeof openMarkdown
  openMarkdownAtPath: typeof openMarkdownAtPath
  saveMarkdown: typeof saveMarkdown
  saveMarkdownAs: typeof saveMarkdownAs
  removeRecentDocument: typeof removeRecentDocument
}

export const createEditorCommandsRuntimeServices = (): EditorCommandsRuntimeServices => ({
  bridgeAvailable: hasMarkTextBridge,
  confirmCloseDocument,
  openMarkdown,
  openMarkdownAtPath,
  saveMarkdown,
  saveMarkdownAs,
  removeRecentDocument
})
