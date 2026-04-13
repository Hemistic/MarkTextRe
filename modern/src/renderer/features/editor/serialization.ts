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
    tabs: tabs.map(tab => ({
      id: tab.id,
      pathname: tab.pathname,
      filename: tab.filename,
      markdown: tab.markdown,
      dirty: tab.dirty,
      kind: tab.kind,
      savedMarkdown: tab.savedMarkdown,
      cursor: null,
      history: null,
      toc: sanitizeForIpc(tab.toc) as EditorSessionTab['toc']
    }))
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
