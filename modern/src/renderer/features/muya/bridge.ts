import {
  ensureMuyaPluginSlots,
  unwrapMuyaConstructorExport
} from './bridgeHelpers'
import {
  bindMuyaEditorChange,
  createMuyaEditorInstance,
  waitForMuyaEditorReady
} from './editorLifecycle'
import { registerMuyaPlugins } from './pluginRegistry'
import type { CreateMuyaEditorOptions, MuyaEditorConstructor, MuyaEditorInstance } from './types'

export type { CreateMuyaEditorOptions, MuyaEditorConstructor, MuyaEditorInstance } from './types'

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
  pathname,
  workspaceRootPath,
  cursor,
  history,
  settings,
  onChange
}: CreateMuyaEditorOptions) => {
  const Muya = await loadMuyaEditorConstructor()
  registerMuyaPlugins(Muya)
  const editor = await waitForMuyaEditorReady(
    createMuyaEditorInstance(Muya, host, markdown, settings, pathname, workspaceRootPath)
  )

  syncMuyaEditorState(editor, markdown, cursor, history)
  bindMuyaEditorChange(editor, onChange)

  return editor
}

export const getMuyaErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}
