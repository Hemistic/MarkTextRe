import type { SettingsState, ThemeName } from '@shared/contracts'
import { pickImagePath, processLocalImagePath } from '../../services/files'

export interface MuyaEditorOptions {
  markdown: string
  focusMode: boolean
  hideQuickInsertHint: boolean
  hideLinkPopup: boolean
  autoCheck: boolean
  spellcheckEnabled: boolean
  disableHtml: boolean
  footnote: boolean
  superSubScript: boolean
  preferLooseListItem: boolean
  bulletListMarker: SettingsState['bulletListMarker']
  orderListDelimiter: SettingsState['orderListDelimiter']
  listIndentation: SettingsState['listIndentation']
  trimUnnecessaryCodeBlockEmptyLines: boolean
  isGitlabCompatibilityEnabled: boolean
  sequenceTheme: SettingsState['sequenceTheme']
  frontmatterType: SettingsState['frontmatterType']
  mermaidTheme: 'default' | 'dark'
  vegaTheme: 'latimes' | 'dark'
  autoPairBracket?: boolean
  autoPairMarkdownSyntax?: boolean
  autoPairQuote?: boolean
  codeBlockLineNumbers?: boolean
  imageAction: (image: unknown, id?: string, alt?: string) => Promise<string | null>
  imagePathPicker: () => Promise<string | null>
  imagePathAutoComplete: () => string[]
  clipboardFilePath: () => string | undefined
}

export type MuyaEditorBaseOptions = Omit<MuyaEditorOptions, 'markdown'>
export type MuyaEditorSettings = Pick<
  SettingsState,
  | 'autoCheck'
  | 'autoPairBracket'
  | 'autoPairMarkdownSyntax'
  | 'autoPairQuote'
  | 'bulletListMarker'
  | 'orderListDelimiter'
  | 'listIndentation'
  | 'preferLooseListItem'
  | 'trimUnnecessaryCodeBlockEmptyLines'
  | 'codeBlockLineNumbers'
  | 'frontmatterType'
  | 'superSubScript'
  | 'footnote'
  | 'isHtmlEnabled'
  | 'isGitlabCompatibilityEnabled'
  | 'sequenceTheme'
  | 'theme'
  | 'spellcheckerEnabled'
  | 'spellcheckerNoUnderline'
  | 'hideLinkPopup'
  | 'hideQuickInsertHint'
>

export const resolveDiagramThemes = (theme?: ThemeName) => {
  if (theme && /dark/i.test(theme)) {
    return {
      mermaidTheme: 'dark' as const,
      vegaTheme: 'dark' as const
    }
  }

  return {
    mermaidTheme: 'default' as const,
    vegaTheme: 'latimes' as const
  }
}

const resolveSourcePath = (image: unknown) => {
  if (typeof image === 'string') {
    return image
  }

  if (image && typeof image === 'object' && 'path' in image) {
    const candidate = (image as { path?: unknown }).path
    return typeof candidate === 'string' ? candidate : null
  }

  return null
}

const resolveSpellcheckEnabled = (settings?: Partial<MuyaEditorSettings>) => {
  return Boolean(settings?.spellcheckerEnabled && !settings?.spellcheckerNoUnderline)
}

export const buildMuyaOptionsFromSettings = (
  settings?: Partial<MuyaEditorSettings>
): Partial<MuyaEditorOptions> => {
  const { mermaidTheme, vegaTheme } = resolveDiagramThemes(settings?.theme)

  return {
    autoCheck: settings?.autoCheck ?? false,
    autoPairBracket: settings?.autoPairBracket ?? true,
    autoPairMarkdownSyntax: settings?.autoPairMarkdownSyntax ?? true,
    autoPairQuote: settings?.autoPairQuote ?? true,
    bulletListMarker: settings?.bulletListMarker ?? '-',
    orderListDelimiter: settings?.orderListDelimiter ?? '.',
    listIndentation: settings?.listIndentation ?? 1,
    preferLooseListItem: settings?.preferLooseListItem ?? true,
    trimUnnecessaryCodeBlockEmptyLines: settings?.trimUnnecessaryCodeBlockEmptyLines ?? true,
    codeBlockLineNumbers: settings?.codeBlockLineNumbers ?? true,
    frontmatterType: settings?.frontmatterType ?? '-',
    superSubScript: settings?.superSubScript ?? false,
    footnote: settings?.footnote ?? false,
    disableHtml: !(settings?.isHtmlEnabled ?? true),
    isGitlabCompatibilityEnabled: settings?.isGitlabCompatibilityEnabled ?? false,
    hideQuickInsertHint: settings?.hideQuickInsertHint ?? false,
    hideLinkPopup: settings?.hideLinkPopup ?? false,
    sequenceTheme: settings?.sequenceTheme ?? 'hand',
    spellcheckEnabled: resolveSpellcheckEnabled(settings),
    mermaidTheme,
    vegaTheme
  }
}

export const createDefaultMuyaEditorOptions = (
  settings?: Partial<SettingsState>,
  context?: {
    documentPathname?: string | null
    workspaceRootPath?: string | null
  }
): MuyaEditorBaseOptions => ({
  focusMode: false,
  imageAction: async (image: unknown) => {
    const sourcePath = resolveSourcePath(image)
    if (!sourcePath) {
      return null
    }

    return processLocalImagePath({
      sourcePath,
      documentPathname: context?.documentPathname ?? null,
      workspaceRootPath: context?.workspaceRootPath ?? null
    })
  },
  imagePathPicker: pickImagePath,
  imagePathAutoComplete: () => [],
  clipboardFilePath: () => undefined,
  hideQuickInsertHint: settings?.hideQuickInsertHint ?? false,
  hideLinkPopup: settings?.hideLinkPopup ?? false,
  autoCheck: settings?.autoCheck ?? false,
  spellcheckEnabled: resolveSpellcheckEnabled(settings),
  disableHtml: !(settings?.isHtmlEnabled ?? true),
  footnote: settings?.footnote ?? false,
  superSubScript: settings?.superSubScript ?? false,
  preferLooseListItem: settings?.preferLooseListItem ?? true,
  bulletListMarker: settings?.bulletListMarker ?? '-',
  orderListDelimiter: settings?.orderListDelimiter ?? '.',
  listIndentation: settings?.listIndentation ?? 1,
  frontmatterType: settings?.frontmatterType ?? '-',
  sequenceTheme: settings?.sequenceTheme ?? 'hand',
  trimUnnecessaryCodeBlockEmptyLines: settings?.trimUnnecessaryCodeBlockEmptyLines ?? true,
  codeBlockLineNumbers: settings?.codeBlockLineNumbers ?? true,
  isGitlabCompatibilityEnabled: settings?.isGitlabCompatibilityEnabled ?? false,
  autoPairBracket: settings?.autoPairBracket ?? true,
  autoPairMarkdownSyntax: settings?.autoPairMarkdownSyntax ?? true,
  autoPairQuote: settings?.autoPairQuote ?? true,
  ...resolveDiagramThemes(settings?.theme)
})
