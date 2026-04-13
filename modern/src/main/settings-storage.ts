import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import type {
  AutoSwitchTheme,
  BulletListMarker,
  EndOfLine,
  FileSortBy,
  FrontmatterType,
  ImageInsertAction,
  ListIndentation,
  OrderListDelimiter,
  PreferHeadingStyle,
  SequenceTheme,
  SettingsPatch,
  SettingsState,
  StartUpAction,
  TextDirection,
  ThemeName,
  TitleBarStyle,
  TrimTrailingNewlineMode
} from '@shared/contracts'
import { settingsStatePath } from './paths'

const TITLE_BAR_STYLE_VALUES = ['custom', 'native'] as const
const FILE_SORT_BY_VALUES = ['created', 'modified', 'title'] as const
const STARTUP_ACTION_VALUES = ['folder', 'lastState', 'blank'] as const
const END_OF_LINE_VALUES = ['default', 'lf', 'crlf'] as const
const TEXT_DIRECTION_VALUES = ['ltr', 'rtl'] as const
const IMAGE_INSERT_ACTION_VALUES = ['upload', 'folder', 'path'] as const
const BULLET_LIST_MARKER_VALUES = ['-', '*', '+'] as const
const ORDER_LIST_DELIMITER_VALUES = ['.', ')'] as const
const PREFER_HEADING_STYLE_VALUES = ['atx', 'setext'] as const
const LIST_INDENTATION_VALUES = ['dfm', 'tab', 1, 2, 3, 4] as const
const FRONTMATTER_TYPE_VALUES = ['-', '+', ';', '{'] as const
const SEQUENCE_THEME_VALUES = ['hand', 'simple'] as const
const THEME_VALUES = ['light', 'dark', 'graphite', 'material-dark', 'ulysses', 'one-dark'] as const
const AUTO_SWITCH_THEME_VALUES = [0, 1, 2] as const
const TRIM_TRAILING_NEWLINE_VALUES = [0, 1, 2, 3] as const

const DEFAULT_ENCODING_VALUES = [
  'ascii',
  'utf8',
  'utf16be',
  'utf16le',
  'utf32be',
  'utf32le',
  'latin3',
  'iso885915',
  'cp1252',
  'arabic',
  'cp1256',
  'latin4',
  'cp1257',
  'iso88592',
  'windows1250',
  'cp866',
  'iso88595',
  'koi8r',
  'koi8u',
  'cp1251',
  'iso885913',
  'greek',
  'cp1253',
  'hebrew',
  'cp1255',
  'latin5',
  'cp1254',
  'gb2312',
  'gb18030',
  'gbk',
  'big5',
  'big5hkscs',
  'shiftjis',
  'eucjp',
  'euckr',
  'latin6'
] as const

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const pickBoolean = (value: unknown, fallback: boolean) => {
  return typeof value === 'boolean' ? value : fallback
}

const pickNumber = (value: unknown, fallback: number, min?: number, max?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  if (typeof min === 'number' && value < min) {
    return fallback
  }

  if (typeof max === 'number' && value > max) {
    return fallback
  }

  return value
}

const pickInteger = (value: unknown, fallback: number, min?: number, max?: number) => {
  if (!Number.isInteger(value)) {
    return fallback
  }

  return pickNumber(value, fallback, min, max)
}

const pickString = (value: unknown, fallback: string, pattern?: RegExp) => {
  if (typeof value !== 'string') {
    return fallback
  }

  if (pattern && !pattern.test(value)) {
    return fallback
  }

  return value
}

const pickStringArray = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    return fallback
  }

  return [...value]
}

const pickEnum = <T extends string | number>(
  value: unknown,
  fallback: T,
  allowedValues: readonly T[]
) => {
  return allowedValues.includes(value as T) ? (value as T) : fallback
}

export const createDefaultSettingsState = (): SettingsState => ({
  autoSave: false,
  autoSaveDelay: 5000,
  titleBarStyle: 'custom',
  openFilesInNewWindow: false,
  openFolderInNewWindow: false,
  zoom: 1,
  hideScrollbar: false,
  wordWrapInToc: false,
  fileSortBy: 'created',
  startUpAction: 'lastState',
  defaultDirectoryToOpen: '',
  language: 'en',
  editorFontFamily: 'Open Sans',
  fontSize: 16,
  lineHeight: 1.6,
  codeFontSize: 14,
  codeFontFamily: 'DejaVu Sans Mono',
  codeBlockLineNumbers: true,
  trimUnnecessaryCodeBlockEmptyLines: true,
  editorLineWidth: '',
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  endOfLine: 'default',
  defaultEncoding: 'utf8',
  autoGuessEncoding: true,
  trimTrailingNewline: 2,
  textDirection: 'ltr',
  hideQuickInsertHint: false,
  imageInsertAction: 'path',
  imagePreferRelativeDirectory: false,
  imageRelativeDirectoryName: 'assets',
  hideLinkPopup: false,
  autoCheck: false,
  preferLooseListItem: true,
  bulletListMarker: '-',
  orderListDelimiter: '.',
  preferHeadingStyle: 'atx',
  tabSize: 4,
  listIndentation: 1,
  frontmatterType: '-',
  superSubScript: false,
  footnote: false,
  isHtmlEnabled: true,
  isGitlabCompatibilityEnabled: false,
  sequenceTheme: 'hand',
  theme: 'light',
  autoSwitchTheme: 2,
  spellcheckerEnabled: false,
  spellcheckerNoUnderline: false,
  spellcheckerLanguage: 'en-US',
  sideBarVisibility: false,
  tabBarVisibility: false,
  sourceCodeModeEnabled: false,
  searchExclusions: [],
  searchMaxFileSize: '',
  searchIncludeHidden: false,
  searchNoIgnore: false,
  searchFollowSymlinks: true,
  watcherUsePolling: false,
  imageFolderPath: path.join(app.getPath('userData'), 'images')
})

export const sanitizeSettingsState = (value: unknown): SettingsState => {
  const defaults = createDefaultSettingsState()
  const data = isRecord(value) ? value : {}

  return {
    autoSave: pickBoolean(data.autoSave, defaults.autoSave),
    autoSaveDelay: pickInteger(data.autoSaveDelay, defaults.autoSaveDelay, 1000, 10000),
    titleBarStyle: pickEnum<TitleBarStyle>(data.titleBarStyle, defaults.titleBarStyle, TITLE_BAR_STYLE_VALUES),
    openFilesInNewWindow: pickBoolean(data.openFilesInNewWindow, defaults.openFilesInNewWindow),
    openFolderInNewWindow: pickBoolean(data.openFolderInNewWindow, defaults.openFolderInNewWindow),
    zoom: pickNumber(data.zoom, defaults.zoom, 0.5, 2),
    hideScrollbar: pickBoolean(data.hideScrollbar, defaults.hideScrollbar),
    wordWrapInToc: pickBoolean(data.wordWrapInToc, defaults.wordWrapInToc),
    fileSortBy: pickEnum<FileSortBy>(data.fileSortBy, defaults.fileSortBy, FILE_SORT_BY_VALUES),
    startUpAction: pickEnum<StartUpAction>(data.startUpAction, defaults.startUpAction, STARTUP_ACTION_VALUES),
    defaultDirectoryToOpen: pickString(data.defaultDirectoryToOpen, defaults.defaultDirectoryToOpen),
    language: pickString(data.language, defaults.language),
    editorFontFamily: pickString(data.editorFontFamily, defaults.editorFontFamily, /^[^\s]+(([-\s])*[^\s])*$/),
    fontSize: pickInteger(data.fontSize, defaults.fontSize, 12, 32),
    lineHeight: pickNumber(data.lineHeight, defaults.lineHeight, 1.2, 2),
    codeFontSize: pickInteger(data.codeFontSize, defaults.codeFontSize, 12, 28),
    codeFontFamily: pickString(data.codeFontFamily, defaults.codeFontFamily, /^[^\s]+(([-\s])*[^\s])*$/),
    codeBlockLineNumbers: pickBoolean(data.codeBlockLineNumbers, defaults.codeBlockLineNumbers),
    trimUnnecessaryCodeBlockEmptyLines: pickBoolean(
      data.trimUnnecessaryCodeBlockEmptyLines,
      defaults.trimUnnecessaryCodeBlockEmptyLines
    ),
    editorLineWidth: pickString(data.editorLineWidth, defaults.editorLineWidth, /^(?:$|[0-9]+(?:ch|px|%)$)/),
    autoPairBracket: pickBoolean(data.autoPairBracket, defaults.autoPairBracket),
    autoPairMarkdownSyntax: pickBoolean(data.autoPairMarkdownSyntax, defaults.autoPairMarkdownSyntax),
    autoPairQuote: pickBoolean(data.autoPairQuote, defaults.autoPairQuote),
    endOfLine: pickEnum<EndOfLine>(data.endOfLine, defaults.endOfLine, END_OF_LINE_VALUES),
    defaultEncoding: pickEnum(data.defaultEncoding, defaults.defaultEncoding, DEFAULT_ENCODING_VALUES),
    autoGuessEncoding: pickBoolean(data.autoGuessEncoding, defaults.autoGuessEncoding),
    trimTrailingNewline: pickEnum<TrimTrailingNewlineMode>(
      data.trimTrailingNewline,
      defaults.trimTrailingNewline,
      TRIM_TRAILING_NEWLINE_VALUES
    ),
    textDirection: pickEnum<TextDirection>(data.textDirection, defaults.textDirection, TEXT_DIRECTION_VALUES),
    hideQuickInsertHint: pickBoolean(data.hideQuickInsertHint, defaults.hideQuickInsertHint),
    imageInsertAction: pickEnum<ImageInsertAction>(
      data.imageInsertAction,
      defaults.imageInsertAction,
      IMAGE_INSERT_ACTION_VALUES
    ),
    imagePreferRelativeDirectory: pickBoolean(
      data.imagePreferRelativeDirectory,
      defaults.imagePreferRelativeDirectory
    ),
    imageRelativeDirectoryName: pickString(data.imageRelativeDirectoryName, defaults.imageRelativeDirectoryName),
    hideLinkPopup: pickBoolean(data.hideLinkPopup, defaults.hideLinkPopup),
    autoCheck: pickBoolean(data.autoCheck, defaults.autoCheck),
    preferLooseListItem: pickBoolean(data.preferLooseListItem, defaults.preferLooseListItem),
    bulletListMarker: pickEnum<BulletListMarker>(
      data.bulletListMarker,
      defaults.bulletListMarker,
      BULLET_LIST_MARKER_VALUES
    ),
    orderListDelimiter: pickEnum<OrderListDelimiter>(
      data.orderListDelimiter,
      defaults.orderListDelimiter,
      ORDER_LIST_DELIMITER_VALUES
    ),
    preferHeadingStyle: pickEnum<PreferHeadingStyle>(
      data.preferHeadingStyle,
      defaults.preferHeadingStyle,
      PREFER_HEADING_STYLE_VALUES
    ),
    tabSize: pickInteger(data.tabSize, defaults.tabSize, 1, 4),
    listIndentation: pickEnum<ListIndentation>(data.listIndentation, defaults.listIndentation, LIST_INDENTATION_VALUES),
    frontmatterType: pickEnum<FrontmatterType>(
      data.frontmatterType,
      defaults.frontmatterType,
      FRONTMATTER_TYPE_VALUES
    ),
    superSubScript: pickBoolean(data.superSubScript, defaults.superSubScript),
    footnote: pickBoolean(data.footnote, defaults.footnote),
    isHtmlEnabled: pickBoolean(data.isHtmlEnabled, defaults.isHtmlEnabled),
    isGitlabCompatibilityEnabled: pickBoolean(
      data.isGitlabCompatibilityEnabled,
      defaults.isGitlabCompatibilityEnabled
    ),
    sequenceTheme: pickEnum<SequenceTheme>(data.sequenceTheme, defaults.sequenceTheme, SEQUENCE_THEME_VALUES),
    theme: pickEnum<ThemeName>(data.theme, defaults.theme, THEME_VALUES),
    autoSwitchTheme: pickEnum<AutoSwitchTheme>(data.autoSwitchTheme, defaults.autoSwitchTheme, AUTO_SWITCH_THEME_VALUES),
    spellcheckerEnabled: pickBoolean(data.spellcheckerEnabled, defaults.spellcheckerEnabled),
    spellcheckerNoUnderline: pickBoolean(data.spellcheckerNoUnderline, defaults.spellcheckerNoUnderline),
    spellcheckerLanguage: pickString(data.spellcheckerLanguage, defaults.spellcheckerLanguage),
    sideBarVisibility: pickBoolean(data.sideBarVisibility, defaults.sideBarVisibility),
    tabBarVisibility: pickBoolean(data.tabBarVisibility, defaults.tabBarVisibility),
    sourceCodeModeEnabled: pickBoolean(data.sourceCodeModeEnabled, defaults.sourceCodeModeEnabled),
    searchExclusions: pickStringArray(data.searchExclusions, defaults.searchExclusions),
    searchMaxFileSize: pickString(data.searchMaxFileSize, defaults.searchMaxFileSize, /^(?:$|[0-9]+(?:K|M|G)?$)/),
    searchIncludeHidden: pickBoolean(data.searchIncludeHidden, defaults.searchIncludeHidden),
    searchNoIgnore: pickBoolean(data.searchNoIgnore, defaults.searchNoIgnore),
    searchFollowSymlinks: pickBoolean(data.searchFollowSymlinks, defaults.searchFollowSymlinks),
    watcherUsePolling: pickBoolean(data.watcherUsePolling, defaults.watcherUsePolling),
    imageFolderPath: pickString(data.imageFolderPath, defaults.imageFolderPath)
  }
}

const readJsonFile = async (pathname: string) => {
  try {
    const text = await readFile(pathname, 'utf8')
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

const getLegacySettingsDirectoryCandidates = () => {
  const appDataPath = app.getPath('appData')
  const currentUserDataPath = app.getPath('userData')

  return Array.from(new Set([
    path.join(appDataPath, 'marktext'),
    path.join(appDataPath, 'MarkText'),
    currentUserDataPath
  ]))
}

const readLegacySettingsState = async (): Promise<SettingsState | null> => {
  for (const directory of getLegacySettingsDirectoryCandidates()) {
    const legacyPreferences = await readJsonFile(path.join(directory, 'preferences.json'))
    const legacyDataCenter = await readJsonFile(path.join(directory, 'dataCenter.json'))

    if (legacyPreferences || legacyDataCenter) {
      const merged = {
        ...(isRecord(legacyPreferences) ? legacyPreferences : {}),
        ...(isRecord(legacyDataCenter)
          ? {
              imageFolderPath: legacyDataCenter.imageFolderPath
            }
          : {})
      }

      return sanitizeSettingsState(merged)
    }
  }

  return null
}

const persistSettingsState = async (state: SettingsState) => {
  const pathname = settingsStatePath()
  await mkdir(path.dirname(pathname), { recursive: true })
  await writeFile(pathname, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export const readSettingsState = async (): Promise<SettingsState> => {
  const storedState = await readJsonFile(settingsStatePath())
  if (storedState) {
    const sanitized = sanitizeSettingsState(storedState)
    await persistSettingsState(sanitized)
    return sanitized
  }

  const migrated = await readLegacySettingsState()
  const initialState = migrated ?? createDefaultSettingsState()
  await persistSettingsState(initialState)
  return initialState
}

export const writeSettingsPatch = async (patch: SettingsPatch): Promise<SettingsState> => {
  const current = await readSettingsState()
  const next = sanitizeSettingsState({
    ...current,
    ...patch
  })
  await persistSettingsState(next)
  return next
}
