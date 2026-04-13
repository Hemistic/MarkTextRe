import type { EditorChangePayload } from '../editor/types'
import {
  ensureMuyaPluginSlots,
  unwrapMuyaConstructorExport
} from './bridgeHelpers'

export interface MuyaEditorOptions {
  markdown: string
  focusMode: boolean
  hideQuickInsertHint: boolean
  spellcheckEnabled: boolean
  disableHtml: boolean
  imagePathAutoComplete: () => string[]
  clipboardFilePath: () => string | undefined
}

export interface MuyaEditorInstance {
  ready?: Promise<void>
  setMarkdown: (markdown: string, cursor?: unknown, renderCursor?: boolean) => void
  setHistory?: (history: unknown) => void
  undo?: () => void
  redo?: () => void
  search?: (value: string, options?: Record<string, unknown>) => unknown[]
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

type MuyaEditorConstructor = new (host: HTMLElement, options: MuyaEditorOptions) => MuyaEditorInstance

interface CreateMuyaEditorOptions {
  host: HTMLElement
  markdown: string
  cursor?: unknown
  history?: unknown
  onChange: (payload: EditorChangePayload) => void
}

const DEFAULT_EDITOR_OPTIONS: Omit<MuyaEditorOptions, 'markdown'> = {
  focusMode: false,
  hideQuickInsertHint: true,
  spellcheckEnabled: false,
  disableHtml: false,
  imagePathAutoComplete: () => [],
  clipboardFilePath: () => undefined
}

let muyaConstructorPromise: Promise<MuyaEditorConstructor> | null = null

export const resolveMuyaConstructor = (module: unknown): MuyaEditorConstructor => {
  const candidate = unwrapMuyaConstructorExport(module)

  if (typeof candidate !== 'function') {
    throw new Error('Legacy Muya constructor export is invalid.')
  }

  return candidate as unknown as MuyaEditorConstructor
}

const loadMuyaEditorConstructor = async () => {
  if (!muyaConstructorPromise) {
    muyaConstructorPromise = import('legacy-muya/lib/index.js').then(resolveMuyaConstructor)
  }

  return muyaConstructorPromise
}

export { ensureMuyaPluginSlots }
export const syncMuyaEditorState = (
  editor: MuyaEditorInstance,
  markdown: string,
  cursor?: unknown,
  history?: unknown
) => {
  if (cursor) {
    editor.setMarkdown(markdown, cursor, true)
  } else {
    editor.setMarkdown(markdown)
  }

  if (history && typeof editor.setHistory === 'function') {
    editor.setHistory(history)
  }
}

export const createMuyaEditor = async ({
  host,
  markdown,
  cursor,
  history,
  onChange
}: CreateMuyaEditorOptions) => {
  const Muya = await loadMuyaEditorConstructor()
  const editor = ensureMuyaPluginSlots(new Muya(host, {
    ...DEFAULT_EDITOR_OPTIONS,
    markdown
  }))

  if (editor.ready) {
    await editor.ready
  }

  syncMuyaEditorState(editor, markdown, cursor, history)
  editor.on('change', onChange)

  return editor
}

export const getMuyaErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}
