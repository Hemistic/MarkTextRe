<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'legacy-muya/themes/default.css'

const props = defineProps<{
  modelValue: string
}>()

interface MuyaWordCount {
  word: number
  paragraph: number
  character: number
  all: number
}

interface MuyaTocItem {
  content: string
  lvl: number
}

interface MuyaChangePayload {
  markdown: string
  wordCount?: MuyaWordCount
  toc?: MuyaTocItem[]
  cursor?: unknown
  history?: unknown
}

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'editor-change': [payload: MuyaChangePayload]
}>()

const host = ref<HTMLElement | null>(null)
const loadError = ref('')
let editor: any = null
let applyingExternalUpdate = false
let lastMarkdown = props.modelValue

onMounted(async () => {
  if (!host.value) return

  try {
    // @ts-expect-error Legacy Muya source is imported through a Vite alias bridge.
    const { default: Muya } = await import('legacy-muya/lib/index.js')

    editor = new Muya(host.value, {
      markdown: props.modelValue,
      focusMode: false,
      hideQuickInsertHint: true,
      spellcheckEnabled: false,
      disableHtml: false,
      imagePathAutoComplete: () => [],
      clipboardFilePath: () => undefined
    })

    // Muya.destroy() assumes these plugin slots exist, even if the plugins are not registered.
    for (const key of ['quickInsert', 'codePicker', 'tablePicker', 'emojiPicker', 'imagePathPicker']) {
      if (!editor[key]) {
        editor[key] = { destroy () {} }
      }
    }

    editor.on('change', (payload: MuyaChangePayload) => {
      const { markdown } = payload
      lastMarkdown = markdown
      emit('editor-change', payload)
      if (!applyingExternalUpdate && markdown !== props.modelValue) {
        emit('update:modelValue', markdown)
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    loadError.value = message
    console.error('[modern] failed to initialize Muya', error)
  }
})

watch(
  () => props.modelValue,
  markdown => {
    if (!editor || markdown === lastMarkdown) return

    applyingExternalUpdate = true
    lastMarkdown = markdown
    editor.setMarkdown(markdown)
    queueMicrotask(() => {
      applyingExternalUpdate = false
    })
  }
)

onBeforeUnmount(() => {
  editor?.destroy?.()
  editor = null
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
