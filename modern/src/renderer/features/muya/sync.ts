import type { EditorChangePayload } from '../editor/types'
import { syncMuyaEditorState } from './bridge'
import type { MuyaEditorInstance } from './types'

export interface MuyaSyncState {
  applyingExternalUpdate: boolean
  lastMarkdown: string
}

export interface MuyaChangeResult {
  shouldEmitModelUpdate: boolean
  markdown: string
}

export const createMuyaSyncState = (markdown: string): MuyaSyncState => ({
  applyingExternalUpdate: false,
  lastMarkdown: markdown
})

export const shouldSyncMuyaFromModel = (
  editor: MuyaEditorInstance | null,
  markdown: string,
  state: MuyaSyncState
) => {
  return Boolean(editor) && markdown !== state.lastMarkdown
}

export const shouldEmitModelUpdateForChange = (
  state: MuyaSyncState,
  markdown: string,
  modelValue: string
) => {
  return !state.applyingExternalUpdate && markdown !== modelValue
}

export const restoreMuyaFromModel = (
  editor: MuyaEditorInstance,
  state: MuyaSyncState,
  markdown: string,
  cursor: unknown,
  history: unknown,
  scheduleReset: (callback: () => void) => void = queueMicrotask
) => {
  state.applyingExternalUpdate = true
  state.lastMarkdown = markdown

  try {
    syncMuyaEditorState(editor, markdown, cursor, history)
  } finally {
    scheduleReset(() => {
      state.applyingExternalUpdate = false
    })
  }
}

export const handleMuyaChange = (
  state: MuyaSyncState,
  payload: EditorChangePayload,
  modelValue: string
): MuyaChangeResult => {
  const { markdown } = payload
  state.lastMarkdown = markdown

  return {
    markdown,
    shouldEmitModelUpdate: shouldEmitModelUpdateForChange(state, markdown, modelValue)
  }
}
