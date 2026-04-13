import type { MuyaEditorInstance } from './types'

const DEFAULT_EXPORT_DEPTH = 3

export const MUYA_PLUGIN_SLOTS = [
  'quickInsert',
  'codePicker',
  'tablePicker',
  'emojiPicker',
  'imagePathPicker'
] as const

export const ensureMuyaEditorSlot = (editor: MuyaEditorInstance, slot: string) => {
  if (!editor[slot]) {
    editor[slot] = {
      destroy () {}
    }
  }

  return editor[slot]
}

export const ensureMuyaPluginSlots = (editor: MuyaEditorInstance) => {
  for (const slot of MUYA_PLUGIN_SLOTS) {
    ensureMuyaEditorSlot(editor, slot)
  }

  return editor
}

const isObjectWithDefault = (value: unknown): value is { default?: unknown } => {
  return typeof value === 'object' && value !== null && 'default' in value
}

export const unwrapMuyaConstructorExport = (
  module: unknown,
  maxDepth: number = DEFAULT_EXPORT_DEPTH
) => {
  let candidate = module

  for (let i = 0; i < maxDepth; i++) {
    if (!isObjectWithDefault(candidate)) {
      break
    }

    const next = candidate.default
    if (!next || next === candidate) {
      break
    }

    candidate = next
  }

  return candidate
}
