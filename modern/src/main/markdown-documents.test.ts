import path from 'node:path'
import os from 'node:os'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SettingsState } from '@shared/contracts'

const baseDir = path.join(os.tmpdir(), 'marktext-modern-markdown-documents-test', randomUUID())

vi.mock('./recent-documents', () => ({
  updateRecentDocuments: vi.fn(async () => {})
}))

vi.mock('./settings-storage', () => ({
  readSettingsState: vi.fn()
}))

import { readSettingsState } from './settings-storage'
import { openMarkdownDocument, saveMarkdownDocument } from './markdown-documents'

const readSettingsStateMock = vi.mocked(readSettingsState)

const createSettings = (overrides: Partial<SettingsState> = {}): SettingsState => ({
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
  imageFolderPath: path.join(baseDir, 'images'),
  ...overrides
})

describe('markdown documents', () => {
  beforeEach(async () => {
    await fs.rm(baseDir, { recursive: true, force: true })
    await fs.mkdir(baseDir, { recursive: true })
    vi.clearAllMocks()
  })

  afterAll(async () => {
    await fs.rm(baseDir, { recursive: true, force: true })
  })

  it('opens markdown files with normalized line endings and detected trailing newline behavior', async () => {
    const pathname = path.join(baseDir, 'crlf.md')
    await fs.writeFile(pathname, '# Example\r\n', 'utf8')
    readSettingsStateMock.mockResolvedValue(createSettings())

    const document = await openMarkdownDocument(pathname)

    expect(document.markdown).toBe('# Example\n')
    expect(document.lineEnding).toBe('crlf')
    expect(document.adjustLineEndingOnSave).toBe(true)
    expect(document.trimTrailingNewline).toBe(1)
    expect(document.encoding).toEqual({
      encoding: 'utf8',
      isBom: false
    })
  })

  it('saves markdown with trailing newline and CRLF conversion', async () => {
    const pathname = path.join(baseDir, 'saved.md')
    readSettingsStateMock.mockResolvedValue(createSettings({
      defaultEncoding: 'utf8',
      endOfLine: 'crlf',
      trimTrailingNewline: 1
    }))

    const result = await saveMarkdownDocument(pathname, {
      pathname,
      filename: 'saved.md',
      markdown: '# Example\n\n',
      lineEnding: 'crlf',
      adjustLineEndingOnSave: true,
      trimTrailingNewline: 1,
      encoding: {
        encoding: 'utf8',
        isBom: false
      }
    })

    const raw = await fs.readFile(pathname, 'utf8')
    expect(raw).toBe('# Example\r\n')
    expect(result.lineEnding).toBe('crlf')
    expect(result.trimTrailingNewline).toBe(1)
  })
})
