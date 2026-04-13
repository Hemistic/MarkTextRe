export interface AppBootstrap {
  appName: string
  platform: NodeJS.Platform
  versions: {
    chrome: string
    electron: string
    node: string
    v8: string
  }
}

export type EditorViewMode = 'home' | 'editor'
export type EditorTabKind = 'untitled' | 'sample' | 'file'
export type CloseDocumentAction = 'save' | 'discard' | 'cancel'
export type WindowCloseRequestKind = 'get-dirty-documents' | 'save-all-dirty-documents'
export type AppCommand =
  | 'new-file'
  | 'open-file'
  | 'open-path'
  | 'save-file'
  | 'save-file-as'
  | 'undo'
  | 'redo'
  | 'search'

export interface RecentDocument {
  pathname: string
  filename: string
}

export interface DirtyDocumentSummary {
  id: string
  filename: string
}

export interface TocItem {
  content: string
  lvl: number
  slug?: string
}

export interface WindowCloseCoordinator {
  getDirtyDocuments: () => Promise<DirtyDocumentSummary[]>
  saveAllDirtyDocuments: () => Promise<boolean>
}

export interface EditorDocument {
  id: string
  pathname: string | null
  filename: string
  markdown: string
  dirty: boolean
}

export interface SaveDocumentInput {
  pathname: string | null
  filename: string
  markdown: string
}

export interface SaveDocumentResult {
  pathname: string
  filename: string
}

export interface EditorSessionTab {
  id: string
  pathname: string | null
  filename: string
  markdown: string
  dirty: boolean
  kind: EditorTabKind
  savedMarkdown: string
  cursor: unknown
  history: unknown
  toc: TocItem[]
}

export interface EditorSessionState {
  viewMode: EditorViewMode
  activeTabId: string | null
  untitledSequence: number
  tabs: EditorSessionTab[]
}

export interface WindowCloseRequest {
  requestId: string
  kind: WindowCloseRequestKind
}

export interface WindowCloseResponse {
  requestId: string
  dirtyDocuments?: DirtyDocumentSummary[]
  ok: boolean
  error?: string
}

export interface AppCommandMessage {
  command: AppCommand
  pathname?: string | null
}

export interface MarkTextAppApi {
  getBootstrap: () => Promise<AppBootstrap>
  setDirtyState: (hasDirtyDocuments: boolean) => Promise<void>
  getSessionState: () => Promise<EditorSessionState | null>
  setSessionState: (sessionState: EditorSessionState) => Promise<void>
  confirmCloseDocument: (filename: string) => Promise<CloseDocumentAction>
  registerAppCommandHandler: (handler: (message: AppCommandMessage) => void) => () => void
  registerWindowCloseCoordinator: (coordinator: WindowCloseCoordinator) => void
}

export interface MarkTextFilesApi {
  getRecentDocuments: () => Promise<RecentDocument[]>
  removeRecentDocument: (pathname: string) => Promise<void>
  openMarkdown: () => Promise<EditorDocument | null>
  openMarkdownAtPath: (pathname: string) => Promise<EditorDocument | null>
  pickImage: () => Promise<string | null>
  saveMarkdown: (input: SaveDocumentInput) => Promise<SaveDocumentResult | null>
  saveMarkdownAs: (input: SaveDocumentInput) => Promise<SaveDocumentResult | null>
}

export interface MarkTextWindowApi {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  toggleDevTools: () => Promise<void>
}

export interface MarkTextApi {
  app: MarkTextAppApi
  files: MarkTextFilesApi
  window: MarkTextWindowApi
}
