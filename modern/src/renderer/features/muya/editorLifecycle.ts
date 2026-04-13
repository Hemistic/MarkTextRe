import { ensureMuyaPluginSlots } from './bridgeHelpers'
import { createDefaultMuyaEditorOptions } from './editorOptions'
import type { CreateMuyaEditorOptions, MuyaEditorConstructor, MuyaEditorInstance } from './types'

export const createMuyaEditorInstance = (
  Muya: MuyaEditorConstructor,
  host: HTMLElement,
  markdown: string,
  settings?: CreateMuyaEditorOptions['settings'],
  pathname?: string | null,
  workspaceRootPath?: string | null
) => {
  return ensureMuyaPluginSlots(new Muya(host, {
    ...createDefaultMuyaEditorOptions(settings, {
      documentPathname: pathname,
      workspaceRootPath
    }),
    markdown
  }))
}

export const waitForMuyaEditorReady = async (editor: MuyaEditorInstance) => {
  if (editor.ready) {
    await editor.ready
  }

  return editor
}

export const bindMuyaEditorChange = (
  editor: MuyaEditorInstance,
  onChange: CreateMuyaEditorOptions['onChange']
) => {
  editor.on('change', onChange)
  return editor
}
