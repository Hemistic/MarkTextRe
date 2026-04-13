import type { EditorSessionState, EditorSessionTab, EditorViewMode } from '@shared/contracts'
import type { EditorTab } from './types'
import { summarizeMarkdown } from './document'

export interface ResolvedSessionState {
  tabs: EditorTab[]
  activeTabId: string | null
  viewMode: EditorViewMode
  untitledSequence: number
}

export const restoreSessionTab = (tab: EditorSessionTab): EditorTab => {
  const summary = summarizeMarkdown(tab.markdown)
  const headings = tab.toc.length > 0
    ? tab.toc.map(item => ({
      depth: item.lvl,
      text: item.content
    }))
    : summary.headings

  return {
    id: tab.id,
    pathname: tab.pathname,
    filename: tab.filename,
    markdown: tab.markdown,
    dirty: tab.dirty,
    kind: tab.kind,
    savedMarkdown: tab.savedMarkdown,
    headings,
    lineCount: summary.lineCount,
    wordCount: summary.wordCount,
    cursor: tab.cursor ?? null,
    history: tab.history ?? null,
    toc: Array.isArray(tab.toc) ? tab.toc : [],
    encoding: tab.encoding ?? { encoding: 'utf8', isBom: false },
    lineEnding: tab.lineEnding ?? 'lf',
    adjustLineEndingOnSave: tab.adjustLineEndingOnSave ?? false,
    trimTrailingNewline: tab.trimTrailingNewline ?? 2,
    isMixedLineEndings: tab.isMixedLineEndings ?? false
  }
}

export const resolveSessionState = (sessionState: EditorSessionState | null): ResolvedSessionState => {
  if (!sessionState || sessionState.tabs.length === 0) {
    return {
      tabs: [],
      activeTabId: null,
      viewMode: 'home',
      untitledSequence: 1
    }
  }

  const tabs = sessionState.tabs.map(restoreSessionTab)
  const activeTabId = tabs.some(tab => tab.id === sessionState.activeTabId)
    ? sessionState.activeTabId
    : tabs[0]?.id ?? null

  return {
    tabs,
    activeTabId,
    untitledSequence: Math.max(sessionState.untitledSequence, 1),
    viewMode: activeTabId ? 'editor' : 'home'
  }
}
