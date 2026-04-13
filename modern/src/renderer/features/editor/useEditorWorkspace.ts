import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { startEditorWorkspaceRuntime } from './workspaceRuntimeBindings'
import { createEditorWorkspaceViewState } from './workspaceViewSupport'
import { useEditorStore } from '../../stores/editor'

export const useEditorWorkspace = () => {
  const editor = useEditorStore()
  const {
    bootstrap,
    viewMode,
    tabs,
    activeTabId,
    activeDocument,
    projectTree,
    recentDocuments,
    headings
  } = storeToRefs(editor)
  const viewState = createEditorWorkspaceViewState({
    activeDocument,
    activeTabId,
    bootstrap,
    headings,
    projectTree,
    recentDocuments,
    tabs,
    viewMode
  })

  let unregisterAppCommandHandler = () => {}

  onMounted(() => {
    unregisterAppCommandHandler = startEditorWorkspaceRuntime({ editor })
  })

  onBeforeUnmount(() => {
    unregisterAppCommandHandler()
  })

  return {
    editor,
    viewState
  }
}
