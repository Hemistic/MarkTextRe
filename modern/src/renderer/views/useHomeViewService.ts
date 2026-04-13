import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEditorWorkspace } from '../features/editor/useEditorWorkspace'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'
import { useHomeSearch } from './useHomeSearch'
import { startHomeEditorCommandBindings } from './homeEditorCommandBindings'
import { createHomeViewActions } from './homeViewActions'
import { useHomeViewBindings } from './useHomeViewBindings'

export const useHomeViewService = () => {
  const workspace = useEditorWorkspace()
  const { editor, viewState } = workspace

  const muyaEditor = ref<MuyaEditorExpose | null>(null)
  const sideBar = ref<SidebarExpose | null>(null)
  const actions = createHomeViewActions(editor)
  const search = useHomeSearch({
    applyEditorChange: editor.applyActiveEditorState,
    muyaEditor,
    sideBar,
    sideBarMode: viewState.sideBarMode
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
    () => viewState.activeDocument.value?.id ?? null,
    search.refreshActiveDocumentSearch
  )

  const bindings = useHomeViewBindings({
    actions,
    muyaEditor,
    search,
    sideBar,
    view: viewState
  })

  return {
    bindings
  }
}
