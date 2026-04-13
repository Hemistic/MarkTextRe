export interface MuyaEditorOptions {
  markdown: string
  focusMode: boolean
  hideQuickInsertHint: boolean
  spellcheckEnabled: boolean
  disableHtml: boolean
  imagePathAutoComplete: () => string[]
  clipboardFilePath: () => string | undefined
}

export type MuyaEditorBaseOptions = Omit<MuyaEditorOptions, 'markdown'>

export const createDefaultMuyaEditorOptions = (): MuyaEditorBaseOptions => ({
  focusMode: false,
  hideQuickInsertHint: true,
  spellcheckEnabled: false,
  disableHtml: false,
  imagePathAutoComplete: () => [],
  clipboardFilePath: () => undefined
})
