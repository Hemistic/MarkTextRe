import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEditorWorkspace } from '../features/editor/useEditorWorkspace'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'
import { useHomeSearch } from './useHomeSearch'
import { startHomeEditorCommandBindings } from './homeEditorCommandBindings'
import { createHomeViewActions } from './homeViewActions'
import { useHomeViewBindings } from './useHomeViewBindings'
import { createHomeEditorCommandExecutor } from './homeViewRuntimeSupport'
import { useSettingsStore } from '../stores/settings'
import { sortProjectTree } from '../features/editor/projectTreeSortSupport'

export const useHomeViewService = () => {
  const workspace = useEditorWorkspace()
  const { editor, viewState } = workspace
  const settings = useSettingsStore()
  const showTabBar = computed(() => settings.state?.tabBarVisibility ?? false)

  const muyaEditor = ref<MuyaEditorExpose | null>(null)
  const sideBar = ref<SidebarExpose | null>(null)
  const isSettingsOpen = ref(false)
  const actions = createHomeViewActions(editor, undefined, {
    openSettingsPanel: () => {
      isSettingsOpen.value = true
    }
  })
  const search = useHomeSearch({
    applyEditorChange: editor.applyActiveEditorState,
    muyaEditor,
    sideBar,
    sideBarMode: viewState.sideBarMode
  })

  let unregisterEditorCommands = () => {}

  onMounted(() => {
    unregisterEditorCommands = startHomeEditorCommandBindings({
      executor: createHomeEditorCommandExecutor(search, muyaEditor)
    })
  })

  onBeforeUnmount(() => {
    unregisterEditorCommands()
  })

  watch(
    () => viewState.activeDocument.value?.id ?? null,
    search.refreshActiveDocumentSearch
  )

  watch(
    () => settings.state?.sideBarVisibility ?? false,
    visible => {
      if (!visible) {
        viewState.sideBarMode.value = ''
        return
      }

      if (!viewState.sideBarMode.value) {
        viewState.sideBarMode.value = 'files'
      }
    },
    { immediate: true }
  )

  watch(
    [
      () => settings.state?.fileSortBy ?? 'created',
      () => viewState.projectTree.value
    ],
    ([sortBy, projectTree]) => {
      if (!projectTree) {
        return
      }

      sortProjectTree(projectTree, sortBy)
    },
    { immediate: true }
  )

  const bindings = useHomeViewBindings({
    actions,
    muyaEditor,
    search,
    showTabBar,
    sideBar,
    view: viewState
  })

  return {
    bindings,
    closeSettings: () => {
      isSettingsOpen.value = false
    },
    isSettingsOpen,
    settingsState: computed(() => settings.state)
  }
}
