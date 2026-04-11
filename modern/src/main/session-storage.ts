import path from 'node:path'
import { promises as fs } from 'node:fs'
import type {
  EditorSessionState,
  EditorSessionTab
} from '@shared/contracts'
import { sessionStatePath } from './paths'

const isSessionTab = (value: unknown): value is EditorSessionTab => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const tab = value as Record<string, unknown>

  return (
    typeof tab.id === 'string' &&
    (typeof tab.pathname === 'string' || tab.pathname === null) &&
    typeof tab.filename === 'string' &&
    typeof tab.markdown === 'string' &&
    typeof tab.dirty === 'boolean' &&
    (tab.kind === 'untitled' || tab.kind === 'sample' || tab.kind === 'file') &&
    typeof tab.savedMarkdown === 'string' &&
    Array.isArray(tab.toc)
  )
}

export const sanitizeSessionState = (value: unknown): EditorSessionState | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const state = value as Record<string, unknown>
  const tabs = Array.isArray(state.tabs) ? state.tabs.filter(isSessionTab) : []
  const activeTabId = typeof state.activeTabId === 'string' ? state.activeTabId : null
  const viewMode = state.viewMode === 'editor' ? 'editor' : 'home'
  const untitledSequence = typeof state.untitledSequence === 'number' && state.untitledSequence > 0
    ? Math.floor(state.untitledSequence)
    : 1

  return {
    viewMode,
    activeTabId,
    untitledSequence,
    tabs
  }
}

export const readSessionState = async (): Promise<EditorSessionState | null> => {
  try {
    const raw = await fs.readFile(sessionStatePath(), 'utf8')
    return sanitizeSessionState(JSON.parse(raw))
  } catch {
    return null
  }
}

export const writeSessionState = async (sessionState: EditorSessionState) => {
  await fs.mkdir(path.dirname(sessionStatePath()), { recursive: true })
  await fs.writeFile(sessionStatePath(), JSON.stringify(sessionState, null, 2), 'utf8')
}
