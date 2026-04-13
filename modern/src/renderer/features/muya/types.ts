import type { EditorChangePayload } from '../editor/types'
import type { MuyaEditorOptions, MuyaEditorSettings } from './editorOptions'

export interface MuyaEditorInstance {
  ready?: Promise<void>
  setMarkdown: (markdown: string, cursor?: unknown, renderCursor?: boolean) => void
  setHistory?: (history: unknown) => void
  undo?: () => void
  redo?: () => void
  search?: (value: string, options?: Record<string, unknown>) => unknown[]
  replace?: (value: string, options?: Record<string, unknown>) => unknown[]
  find?: (action: 'pre' | 'next') => unknown[]
  on: (event: 'change', handler: (payload: EditorChangePayload) => void) => void
  contentState?: {
    searchMatches?: {
      index: number
      matches: unknown[]
    }
  }
  container?: HTMLElement
  destroy?: () => void
  [key: string]: unknown
}

export interface CreateMuyaEditorOptions {
  host: HTMLElement
  markdown: string
  pathname?: string | null
  workspaceRootPath?: string | null
  cursor?: unknown
  history?: unknown
  settings?: Partial<MuyaEditorSettings>
  onChange: (payload: EditorChangePayload) => void
}

export interface MuyaEditorConstructor {
  new (host: HTMLElement, options: MuyaEditorOptions): MuyaEditorInstance
  use: (plugin: unknown, options?: Record<string, unknown>) => void
}
