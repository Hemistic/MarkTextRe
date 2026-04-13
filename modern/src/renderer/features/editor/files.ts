import type { MarkdownEncoding, SaveDocumentInput, SaveDocumentResult } from '@shared/contracts'
import type { EditorTab } from './types'
import { normalizeOpenedDocument } from './document'
import { sanitizeForIpc } from './session-sanitize-support'
import {
  createEditorFilesRuntimeServices,
  type EditorFilesRuntimeServices
} from './filesRuntimeServices'

export const OPEN_UNAVAILABLE_STATUS = 'Open is unavailable outside the Electron shell.'
export const REOPEN_UNAVAILABLE_STATUS = 'Reopen is unavailable outside the Electron shell.'
export const SAVE_UNAVAILABLE_STATUS = 'Save is unavailable outside the Electron shell.'
export const SAVE_AS_UNAVAILABLE_STATUS = 'Save As is unavailable outside the Electron shell.'
export const RECENT_FILE_OPEN_FAILED_STATUS = 'Recent file could not be opened.'

export const createSavedTab = (current: EditorTab, result: SaveDocumentResult): EditorTab => {
  return {
    ...current,
    id: result.pathname,
    pathname: result.pathname,
    filename: result.filename,
    encoding: result.encoding ?? current.encoding,
    lineEnding: result.lineEnding ?? current.lineEnding,
    adjustLineEndingOnSave: result.adjustLineEndingOnSave ?? current.adjustLineEndingOnSave,
    trimTrailingNewline: result.trimTrailingNewline ?? current.trimTrailingNewline,
    isMixedLineEndings: result.isMixedLineEndings ?? current.isMixedLineEndings,
    dirty: false,
    kind: 'file',
    savedMarkdown: current.markdown
  }
}

export const getDirtyTabIds = (tabs: EditorTab[]) => {
  return tabs
    .filter(tab => tab.dirty)
    .map(tab => tab.id)
}

export const openDocumentFromPicker = async (
  runtimeServices: EditorFilesRuntimeServices = createEditorFilesRuntimeServices()
) => {
  const openedDocument = await runtimeServices.openMarkdown()
  return openedDocument ? normalizeOpenedDocument(openedDocument) : null
}

export const reopenDocumentFromPath = async (
  pathname: string,
  runtimeServices: EditorFilesRuntimeServices = createEditorFilesRuntimeServices()
) => {
  const openedDocument = await runtimeServices.openMarkdownAtPath(pathname)
  return openedDocument ? normalizeOpenedDocument(openedDocument) : null
}

export const saveTabDocument = async (
  current: EditorTab,
  saveAs = false,
  runtimeServices: EditorFilesRuntimeServices = createEditorFilesRuntimeServices()
) => {
  const encoding = sanitizeForIpc(current.encoding) as MarkdownEncoding | undefined
  const saveInput: SaveDocumentInput = {
    pathname: current.pathname,
    filename: current.filename,
    markdown: current.markdown,
    ...(current.pathname
      ? {
          ...(encoding ? { encoding } : {}),
          ...(current.lineEnding ? { lineEnding: current.lineEnding } : {}),
          ...(current.adjustLineEndingOnSave !== undefined
            ? { adjustLineEndingOnSave: current.adjustLineEndingOnSave }
            : {}),
          ...(current.trimTrailingNewline !== undefined
            ? { trimTrailingNewline: current.trimTrailingNewline }
            : {})
        }
      : {})
  }

  const result = saveAs
    ? await runtimeServices.saveMarkdownAs(saveInput)
    : await runtimeServices.saveMarkdown(saveInput)

  return result ? createSavedTab(current, result) : null
}
