import { pickImagePath } from '../../services/files'

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
  imagePathPicker: () => Promise<string | null>
  imagePathAutoComplete: () => string[]
  clipboardFilePath: () => string | undefined
}

export type MuyaEditorBaseOptions = Omit<MuyaEditorOptions, 'markdown'>

export const createDefaultMuyaEditorOptions = (): MuyaEditorBaseOptions => ({
  focusMode: false,
  hideQuickInsertHint: true,
  hideLinkPopup: false,
  autoCheck: false,
  spellcheckEnabled: false,
  disableHtml: false,
  footnote: true,
  superSubScript: false,
  imagePathPicker: pickImagePath,
  imagePathAutoComplete: () => [],
  clipboardFilePath: () => undefined
})
