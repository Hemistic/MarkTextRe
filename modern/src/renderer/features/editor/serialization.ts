import type {
  EditorSessionState,
  EditorSessionTab,
  EditorViewMode
} from '@shared/contracts'
import type { EditorTab } from './types'
import { sanitizeForIpc } from './session-sanitize-support'
export { resolveSessionState } from './session-restore-support'
export type { ResolvedSessionState } from './session-restore-support'

export const serializeSessionState = (
  viewMode: EditorViewMode,
  activeTabId: string | null,
  untitledSequence: number,
  tabs: EditorTab[]
): EditorSessionState => {
  return {
    viewMode,
    activeTabId,
    untitledSequence,
    tabs: tabs.map(tab => {
      const encoding = sanitizeForIpc(tab.encoding) as EditorSessionTab['encoding']

      return {
        id: tab.id,
        pathname: tab.pathname,
        filename: tab.filename,
        markdown: tab.markdown,
        dirty: tab.dirty,
        kind: tab.kind,
        savedMarkdown: tab.savedMarkdown,
        cursor: null,
        history: null,
        toc: sanitizeForIpc(tab.toc) as EditorSessionTab['toc'],
        ...(encoding ? { encoding } : {}),
        ...(tab.lineEnding ? { lineEnding: tab.lineEnding } : {}),
        ...(tab.adjustLineEndingOnSave !== undefined
          ? { adjustLineEndingOnSave: tab.adjustLineEndingOnSave }
          : {}),
        ...(tab.trimTrailingNewline !== undefined
          ? { trimTrailingNewline: tab.trimTrailingNewline }
          : {}),
        ...(tab.isMixedLineEndings !== undefined
          ? { isMixedLineEndings: tab.isMixedLineEndings }
          : {})
      }
    })
  }
}

export const createSessionSnapshotKey = (
  viewMode: EditorViewMode,
  activeTabId: string | null,
  untitledSequence: number,
  tabs: EditorTab[]
) => {
  return JSON.stringify(serializeSessionState(viewMode, activeTabId, untitledSequence, tabs))
}
