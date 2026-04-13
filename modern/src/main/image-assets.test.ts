import path from 'node:path'
import os from 'node:os'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it } from 'vitest'
import type { SettingsState } from '@shared/contracts'
import { processLocalImageWithSettings } from './image-assets'

const createSettings = (baseDir: string, overrides: Partial<SettingsState> = {}): SettingsState => ({
  autoSave: false,
  autoSaveDelay: 5000,
  titleBarStyle: 'custom',
  openFilesInNewWindow: false,
  openFolderInNewWindow: false,
  zoom: 1,
  hideScrollbar: false,
  wordWrapInToc: false,
  fileSortBy: 'modified',
  startUpAction: 'blank',
  defaultDirectoryToOpen: '',
  language: 'en',
  editorFontFamily: '',
  fontSize: 16,
  lineHeight: 1.6,
  codeFontSize: 14,
  codeFontFamily: '',
  codeBlockLineNumbers: true,
  trimUnnecessaryCodeBlockEmptyLines: true,
  editorLineWidth: '',
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  endOfLine: 'default',
  defaultEncoding: 'utf8',
  autoGuessEncoding: true,
  trimTrailingNewline: 3,
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
  sideBarVisibility: true,
  tabBarVisibility: true,
  sourceCodeModeEnabled: false,
  searchExclusions: [],
  searchMaxFileSize: '1MB',
  searchIncludeHidden: false,
  searchNoIgnore: false,
  searchFollowSymlinks: false,
  watcherUsePolling: false,
  imageFolderPath: path.join(baseDir, 'images'),
  ...overrides
})

describe('image-assets', () => {
  const tempDirectories: string[] = []

  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
  })

  it('keeps the original image path when the action is path', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'marktext-image-assets-'))
    tempDirectories.push(baseDir)
    const imagePath = path.join(baseDir, 'demo.png')
    await writeFile(imagePath, 'demo-image')

    const nextPath = await processLocalImageWithSettings({
      sourcePath: imagePath
    }, createSettings(baseDir, {
      imageInsertAction: 'path'
    }))

    expect(nextPath).toBe(imagePath)
  })

  it('copies images into a relative assets folder when folder mode prefers relative paths', async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), 'marktext-image-assets-'))
    tempDirectories.push(baseDir)

    const workspaceRoot = path.join(baseDir, 'workspace')
    const docsDirectory = path.join(workspaceRoot, 'docs')
    const imagesDirectory = path.join(baseDir, 'picked')
    const sourceImagePath = path.join(imagesDirectory, 'demo.png')
    const documentPathname = path.join(docsDirectory, 'note.md')

    await mkdir(imagesDirectory, { recursive: true })
    await mkdir(docsDirectory, { recursive: true })
    await writeFile(sourceImagePath, 'demo-image')
    await writeFile(documentPathname, '# Note')

    const nextPath = await processLocalImageWithSettings({
      sourcePath: sourceImagePath,
      documentPathname,
      workspaceRootPath: workspaceRoot
    }, createSettings(baseDir, {
      imageInsertAction: 'folder',
      imagePreferRelativeDirectory: true,
      imageRelativeDirectoryName: 'assets'
    }))

    expect(nextPath).toMatch(/^..\/assets\/[0-9a-f]+\.png$/)
  })
})
