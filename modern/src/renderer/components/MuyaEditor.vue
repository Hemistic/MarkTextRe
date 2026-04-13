<script setup lang="ts">
import { ref } from 'vue'
import 'legacy-muya/themes/default.css'
import 'legacy-muya/themes/prismjs/light.theme.css'
import '../styles/muya-code-theme.css'
import type { EditorChangePayload } from '../features/editor/types'
import {
  scrollMuyaToHeading
} from '../features/muya/navigation'
import {
  searchMuyaDocument,
  stepMuyaSearch
} from '../features/muya/search'
import { useMuyaEditor } from './useMuyaEditor'

const props = defineProps<{
  documentId: string
  modelValue: string
  cursor?: unknown
  history?: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'editor-change': [payload: EditorChangePayload]
}>()

const host = ref<HTMLElement | null>(null)
const { loadError, editorRef } = useMuyaEditor(host, props, {
  updateModelValue: value => emit('update:modelValue', value),
  editorChange: payload => emit('editor-change', payload)
})

const search = (value: string) => {
  return searchMuyaDocument(editorRef(), value)
}

const find = (direction: 'prev' | 'next') => {
  return stepMuyaSearch(editorRef(), direction)
}

const undo = () => {
  editorRef()?.undo?.()
}

const redo = () => {
  editorRef()?.redo?.()
}

const scrollToHeading = (slug: string) => {
  scrollMuyaToHeading(editorRef()?.container, slug)
}

defineExpose({
  search,
  find,
  undo,
  redo,
  scrollToHeading
})
</script>

<template>
  <div class="muya-shell">
    <div v-if="loadError" class="muya-error">
      <strong>Muya failed to initialize.</strong>
      <code>{{ loadError }}</code>
    </div>
    <div v-else ref="host" class="muya-host" />
  </div>
</template>

<style scoped>
.muya-shell,
.muya-host {
  min-height: 0;
  height: 100%;
}

.muya-shell {
  display: flex;
  flex: 1;
  min-width: 0;
}

.muya-host {
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
  cursor: default;
}

.muya-error {
  display: grid;
  gap: 10px;
  align-content: start;
  height: 100%;
  padding: 18px;
  border: 1px solid rgba(159, 79, 33, 0.28);
  border-radius: 14px;
  background: rgba(159, 79, 33, 0.08);
  color: #6f3412;
}

.muya-error code {
  overflow-wrap: anywhere;
}

.muya-host :deep(.ag-editor-id) {
  min-height: 100%;
}
</style>
