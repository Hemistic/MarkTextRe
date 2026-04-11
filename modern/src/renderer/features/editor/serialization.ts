import type {
  EditorSessionState,
  EditorSessionTab,
  EditorViewMode
} from '@shared/contracts'
import type { EditorTab } from './types'
import { summarizeMarkdown } from './document'

export interface ResolvedSessionState {
  tabs: EditorTab[]
  activeTabId: string | null
  viewMode: EditorViewMode
  untitledSequence: number
}

const sanitizeForIpc = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value == null) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'undefined') {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeForIpc(item, seen))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return null
  }

  if (typeof Node !== 'undefined' && value instanceof Node) {
    return null
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return null
    }

    seen.add(value)

    if (ArrayBuffer.isView(value)) {
      const view = value as ArrayBufferView<ArrayBufferLike>
      return Array.from(new Uint8Array(view.buffer, view.byteOffset, view.byteLength))
    }

    if (value instanceof ArrayBuffer) {
      return Array.from(new Uint8Array(value))
    }

    if (typeof (value as { toJSON?: () => unknown }).toJSON === 'function') {
      return sanitizeForIpc((value as { toJSON: () => unknown }).toJSON(), seen)
    }

    const entries = Object.entries(value as Record<string, unknown>)
    const sanitized = Object.fromEntries(
      entries.map(([key, item]) => [key, sanitizeForIpc(item, seen)])
    )
    seen.delete(value)
    return sanitized
  }

  return null
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
    toc: Array.isArray(tab.toc) ? tab.toc : []
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
      cursor: sanitizeForIpc(tab.cursor),
      history: sanitizeForIpc(tab.history),
      toc: sanitizeForIpc(tab.toc) as EditorSessionTab['toc']
    }))
  }
}
