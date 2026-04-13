import type { BrowserWindow } from 'electron'
import type { SettingsState } from '@shared/contracts'
import { describe, expect, it, vi } from 'vitest'
import { applyWindowSettings } from './window-settings'

const createSettings = (overrides: Partial<SettingsState> = {}): SettingsState => ({
  autoSave: false,
  autoSaveDelay: 5000,
  titleBarStyle: 'custom',
  openFilesInNewWindow: false,
  openFolderInNewWindow: false,
  zoom: 1.25,
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
  spellcheckerEnabled: true,
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
  imageFolderPath: 'D:/images',
  ...overrides
})

const createWindow = (languages = ['en-US', 'de-DE']) => ({
  webContents: {
    setZoomFactor: vi.fn(),
    session: {
      availableSpellCheckerLanguages: languages,
      setSpellCheckerEnabled: vi.fn(),
      setSpellCheckerLanguages: vi.fn()
    }
  }
}) as unknown as BrowserWindow

describe('window settings', () => {
  it('applies zoom and spellchecker settings to the window session', () => {
    const window = createWindow()
    const settings = createSettings()

    applyWindowSettings(window, settings)

    expect(window.webContents.setZoomFactor).toHaveBeenCalledWith(1.25)
    expect(window.webContents.session.setSpellCheckerEnabled).toHaveBeenCalledWith(true)
    expect(window.webContents.session.setSpellCheckerLanguages).toHaveBeenCalledWith(['en-US'])
  })

  it('disables spellchecking when underline suppression is enabled', () => {
    const window = createWindow()
    const settings = createSettings({
      spellcheckerNoUnderline: true
    })

    applyWindowSettings(window, settings)

    expect(window.webContents.session.setSpellCheckerEnabled).toHaveBeenCalledWith(false)
  })
})
