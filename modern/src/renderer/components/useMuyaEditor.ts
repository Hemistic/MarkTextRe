import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import path from 'path'
import type { EditorChangePayload } from '../features/editor/types'
import { createMuyaEditor, getMuyaErrorMessage } from '../features/muya/bridge'
import type { MuyaEditorInstance } from '../features/muya/types'
import {
  createMuyaSyncState,
  handleMuyaChange,
  restoreMuyaFromModel,
  shouldSyncMuyaFromModel
} from '../features/muya/sync'

type MuyaEditorProps = {
  modelValue: string
  pathname?: string | null
  cursor?: unknown
  history?: unknown
}

type MuyaEditorEmitter = {
  updateModelValue: (value: string) => void
  editorChange: (payload: EditorChangePayload) => void
}

export const useMuyaEditor = (
  host: Ref<HTMLElement | null>,
  props: MuyaEditorProps,
  emit: MuyaEditorEmitter
) => {
  const loadError = ref('')
  let editor: MuyaEditorInstance | null = null
  const syncState = createMuyaSyncState(props.modelValue)

  const syncRuntimeDirname = (pathnameValue?: string | null) => {
    globalThis.DIRNAME = pathnameValue ? path.dirname(pathnameValue) : ''
  }

  const restoreEditorState = (markdown: string, cursor?: unknown, history?: unknown) => {
    if (!editor) return

    restoreMuyaFromModel(editor, syncState, markdown, cursor, history)
  }

  onMounted(async () => {
    if (!host.value) return

    syncRuntimeDirname(props.pathname)

    try {
      editor = await createMuyaEditor({
        host: host.value,
        markdown: props.modelValue,
        cursor: props.cursor,
        history: props.history,
        onChange: (payload: EditorChangePayload) => {
          const result = handleMuyaChange(syncState, payload, props.modelValue)
          emit.editorChange(payload)
          if (result.shouldEmitModelUpdate) {
            emit.updateModelValue(result.markdown)
          }
        }
      })
    } catch (error) {
      loadError.value = getMuyaErrorMessage(error)
      console.error('[modern] failed to initialize Muya', error)
    }
  })

  watch(
    () => props.pathname,
    pathnameValue => {
      syncRuntimeDirname(pathnameValue)
    },
    { immediate: true }
  )

  watch(
    () => props.modelValue,
    markdown => {
      if (!shouldSyncMuyaFromModel(editor, markdown, syncState)) return

      restoreEditorState(markdown, props.cursor, props.history)
    }
  )

  onBeforeUnmount(() => {
    editor?.destroy?.()
    editor = null
    globalThis.DIRNAME = ''
  })

  return {
    loadError,
    editorRef: () => editor,
    restoreEditorState
  }
}
