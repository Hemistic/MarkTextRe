import type { MarkTextApi, MarkTextSettingsApi } from '@shared/contracts'
import { afterEach, describe, expect, it } from 'vitest'
import {
  getSettingsApi,
  invokeSettingsAction,
  withSettingsApi
} from './settingsApi'

describe('settingsApi helper', () => {
  const originalWindowMarkText = (globalThis as any).window?.marktext

  const ensureWindow = () => {
    if (!(globalThis as any).window) {
      ;(globalThis as any).window = {}
    }
  }

  const setBridge = (bridge: MarkTextApi | null) => {
    ensureWindow()
    if (bridge) {
      ;(globalThis as any).window.marktext = bridge
      return
    }

    delete (globalThis as any).window.marktext
  }

  const stubSettings: MarkTextSettingsApi = {
    getState: async () => ({
      autoSave: false,
      autoSaveDelay: 5000,
      titleBarStyle: 'custom',
      openFilesInNewWindow: false,
      openFolderInNewWindow: false,
      zoom: 1,
      hideScrollbar: false,
      wordWrapInToc: false,
      fileSortBy: 'created',
      startUpAction: 'blank',
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
      imageFolderPath: 'D:/images'
    }),
    updateState: async patch => ({ ...(await stubSettings.getState()), ...patch }),
    pickPath: async () => 'D:/images'
  }

  const stubApi: MarkTextApi = {
    app: {} as MarkTextApi['app'],
    files: {} as MarkTextApi['files'],
    settings: stubSettings,
    window: {} as MarkTextApi['window']
  }

  afterEach(() => {
    setBridge(originalWindowMarkText ?? null)
  })

  it('returns null when the settings bridge is missing', async () => {
    setBridge(null)

    expect(getSettingsApi()).toBeNull()
    expect(withSettingsApi(() => 'ok')).toBeNull()
    await expect(invokeSettingsAction(async () => 'ok', 'fallback')).resolves.toBe('fallback')
  })

  it('runs actions through the settings bridge when present', async () => {
    setBridge(stubApi)

    expect(getSettingsApi()).toBe(stubSettings)
    expect(withSettingsApi(settings => settings)).toBe(stubSettings)
    await expect(invokeSettingsAction(async () => 'ok', 'fallback')).resolves.toBe('ok')
  })
})
