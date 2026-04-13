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
  | 'open-folder'
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

export interface ProjectTreeNode {
  id: string
  pathname: string
  name: string
  isDirectory: boolean
  isFile: boolean
  isMarkdown: boolean
  createdAtMs?: number
  modifiedAtMs?: number
  isCollapsed?: boolean
  folders?: ProjectTreeNode[]
  files?: ProjectTreeNode[]
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
  encoding?: MarkdownEncoding
  lineEnding?: ResolvedLineEnding
  adjustLineEndingOnSave?: boolean
  trimTrailingNewline?: TrimTrailingNewlineMode
  isMixedLineEndings?: boolean
}

export interface MarkdownEncoding {
  encoding: string
  isBom: boolean
}

export type ResolvedLineEnding = 'lf' | 'crlf'

export interface SaveDocumentInput {
  pathname: string | null
  filename: string
  markdown: string
  encoding?: MarkdownEncoding
  lineEnding?: ResolvedLineEnding
  adjustLineEndingOnSave?: boolean
  trimTrailingNewline?: TrimTrailingNewlineMode
}

export interface SaveDocumentResult {
  pathname: string
  filename: string
  encoding?: MarkdownEncoding
  lineEnding?: ResolvedLineEnding
  adjustLineEndingOnSave?: boolean
  trimTrailingNewline?: TrimTrailingNewlineMode
  isMixedLineEndings?: boolean
}

export interface LocalImageProcessInput {
  sourcePath: string
  documentPathname?: string | null
  workspaceRootPath?: string | null
}

export interface OpenPathSelection {
  kind: 'file' | 'folder'
  pathname: string
}

export type TitleBarStyle = 'custom' | 'native'
export type FileSortBy = 'created' | 'modified' | 'title'
export type StartUpAction = 'folder' | 'lastState' | 'blank'
export type EndOfLine = 'default' | 'lf' | 'crlf'
export type TextDirection = 'ltr' | 'rtl'
export type ImageInsertAction = 'upload' | 'folder' | 'path'
export type BulletListMarker = '-' | '*' | '+'
export type OrderListDelimiter = '.' | ')'
export type PreferHeadingStyle = 'atx' | 'setext'
export type ListIndentation = 'dfm' | 'tab' | 1 | 2 | 3 | 4
export type FrontmatterType = '-' | '+' | ';' | '{'
export type SequenceTheme = 'hand' | 'simple'
export type ThemeName = 'light' | 'dark' | 'graphite' | 'material-dark' | 'ulysses' | 'one-dark'
export type AutoSwitchTheme = 0 | 1 | 2
export type TrimTrailingNewlineMode = 0 | 1 | 2 | 3
export type SettingsPathPickerKind = 'default-directory' | 'image-folder'

export interface SettingsState {
  autoSave: boolean
  autoSaveDelay: number
  titleBarStyle: TitleBarStyle
  openFilesInNewWindow: boolean
  openFolderInNewWindow: boolean
  zoom: number
  hideScrollbar: boolean
  wordWrapInToc: boolean
  fileSortBy: FileSortBy
  startUpAction: StartUpAction
  defaultDirectoryToOpen: string
  language: string
  editorFontFamily: string
  fontSize: number
  lineHeight: number
  codeFontSize: number
  codeFontFamily: string
  codeBlockLineNumbers: boolean
  trimUnnecessaryCodeBlockEmptyLines: boolean
  editorLineWidth: string
  autoPairBracket: boolean
  autoPairMarkdownSyntax: boolean
  autoPairQuote: boolean
  endOfLine: EndOfLine
  defaultEncoding: string
  autoGuessEncoding: boolean
  trimTrailingNewline: TrimTrailingNewlineMode
  textDirection: TextDirection
  hideQuickInsertHint: boolean
  imageInsertAction: ImageInsertAction
  imagePreferRelativeDirectory: boolean
  imageRelativeDirectoryName: string
  hideLinkPopup: boolean
  autoCheck: boolean
  preferLooseListItem: boolean
  bulletListMarker: BulletListMarker
  orderListDelimiter: OrderListDelimiter
  preferHeadingStyle: PreferHeadingStyle
  tabSize: number
  listIndentation: ListIndentation
  frontmatterType: FrontmatterType
  superSubScript: boolean
  footnote: boolean
  isHtmlEnabled: boolean
  isGitlabCompatibilityEnabled: boolean
  sequenceTheme: SequenceTheme
  theme: ThemeName
  autoSwitchTheme: AutoSwitchTheme
  spellcheckerEnabled: boolean
  spellcheckerNoUnderline: boolean
  spellcheckerLanguage: string
  sideBarVisibility: boolean
  tabBarVisibility: boolean
  sourceCodeModeEnabled: boolean
  searchExclusions: string[]
  searchMaxFileSize: string
  searchIncludeHidden: boolean
  searchNoIgnore: boolean
  searchFollowSymlinks: boolean
  watcherUsePolling: boolean
  imageFolderPath: string
}

export type SettingsPatch = Partial<SettingsState>

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
  encoding?: MarkdownEncoding
  lineEnding?: ResolvedLineEnding
  adjustLineEndingOnSave?: boolean
  trimTrailingNewline?: TrimTrailingNewlineMode
  isMixedLineEndings?: boolean
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
  pickOpenPaths: () => Promise<OpenPathSelection[]>
  openMarkdown: () => Promise<EditorDocument | null>
  openMarkdownInNewWindow: () => Promise<boolean>
  openMarkdownAtPath: (pathname: string) => Promise<EditorDocument | null>
  openMarkdownAtPathInNewWindow: (pathname: string) => Promise<boolean>
  openFolder: () => Promise<ProjectTreeNode | null>
  openFolderAtPath: (pathname: string) => Promise<ProjectTreeNode | null>
  openFolderInNewWindow: () => Promise<boolean>
  openFolderAtPathInNewWindow: (pathname: string) => Promise<boolean>
  pickImage: () => Promise<string | null>
  processLocalImage: (input: LocalImageProcessInput) => Promise<string | null>
  saveMarkdown: (input: SaveDocumentInput) => Promise<SaveDocumentResult | null>
  saveMarkdownAs: (input: SaveDocumentInput) => Promise<SaveDocumentResult | null>
}

export interface MarkTextWindowApi {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  toggleDevTools: () => Promise<void>
}

export interface MarkTextSettingsApi {
  getState: () => Promise<SettingsState>
  updateState: (patch: SettingsPatch) => Promise<SettingsState>
  pickPath: (kind: SettingsPathPickerKind, currentPath?: string | null) => Promise<string | null>
}

export interface MarkTextApi {
  app: MarkTextAppApi
  files: MarkTextFilesApi
  settings: MarkTextSettingsApi
  window: MarkTextWindowApi
}
