import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { DocumentWordCount } from './types'
import {
  executeEditorAppCommand,
  mapKeyboardEventToAppCommand
} from './app-commands'
import { useEditorStore } from '../../stores/editor'
import { hasMarkTextBridge } from '../../services/api'
import { registerAppCommandHandler } from '../../services/app'

const EMPTY_WORD_COUNT: DocumentWordCount = {
  word: 0,
  paragraph: 0,
  character: 0,
  all: 0
}

export const useEditorWorkspace = () => {
  const editor = useEditorStore()
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    activeDocument,
    recentDocuments,
    headings
  } = storeToRefs(editor)

  const sideBarMode = ref<'files' | 'search' | 'toc' | ''>('files')

  const titleFilename = computed(() => activeDocument.value?.filename ?? '')
  const titlePathname = computed(() => activeDocument.value?.pathname ?? null)
  const titleDirty = computed(() => activeDocument.value?.dirty ?? false)
  const titleWordCount = computed(() => activeDocument.value?.wordCount ?? EMPTY_WORD_COUNT)
  const showHome = computed(() => viewMode.value === 'home' || !activeDocument.value)

  const handleKeydown = (event: KeyboardEvent) => {
    const command = mapKeyboardEventToAppCommand(event)
    if (!command) {
      return
    }

    event.preventDefault()
    void executeEditorAppCommand(editor, command)
  }

  let unregisterAppCommandHandler = () => {}

  onMounted(() => {
    void editor.loadBootstrap()

    if (hasMarkTextBridge()) {
      unregisterAppCommandHandler = registerAppCommandHandler(command => {
        void executeEditorAppCommand(editor, command)
      })
      return
    }

    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    unregisterAppCommandHandler()
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    editor,
    bootstrap,
    tabs,
    activeTabId,
    activeDocument,
    recentDocuments,
    headings,
    sideBarMode,
    titleFilename,
    titlePathname,
    titleDirty,
    titleWordCount,
    showHome
  }
}
