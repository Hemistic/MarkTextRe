import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEditorWorkspace } from '../features/editor/useEditorWorkspace'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'
import { useHomeSearch } from './useHomeSearch'
import { startHomeEditorCommandBindings } from './homeEditorCommandBindings'
import { createHomeViewActions } from './homeViewActions'
import { useHomeViewBindings } from './useHomeViewBindings'

export const useHomeViewModel = () => {
  const workspace = useEditorWorkspace()
  const {
    editor,
    bootstrap,
    tabs,
    activeTabId,
    activeDocument,
    recentDocuments,
    sideBarMode,
    titleFilename,
    titlePathname,
    titleDirty,
    titleWordCount,
    showHome
  } = workspace

  const muyaEditor = ref<MuyaEditorExpose | null>(null)
  const sideBar = ref<SidebarExpose | null>(null)
  const actions = createHomeViewActions(editor)
  const search = useHomeSearch({
    applyEditorChange: editor.applyActiveEditorState,
    muyaEditor,
    sideBar,
    sideBarMode
  })

  let unregisterEditorCommands = () => {}

  onMounted(() => {
    unregisterEditorCommands = startHomeEditorCommandBindings({
      executor: {
        openSearchPanel: search.openSearchPanel,
        undo: () => {
          muyaEditor.value?.undo()
        },
        redo: () => {
          muyaEditor.value?.redo()
        }
      }
    })
  })

  onBeforeUnmount(() => {
    unregisterEditorCommands()
  })

  watch(
    () => activeDocument.value?.id ?? null,
    search.refreshActiveDocumentSearch
  )

  const bindings = useHomeViewBindings({
    actions,
    activeDocument,
    activeTabId,
    bootstrap,
    muyaEditor,
    recentDocuments,
    search,
    showHome,
    sideBar,
    sideBarMode,
    tabs,
    titleDirty,
    titleFilename,
    titlePathname,
    titleWordCount
  })

  return {
    bindings
  }
}
