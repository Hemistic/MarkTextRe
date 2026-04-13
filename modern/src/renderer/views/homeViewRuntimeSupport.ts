import type { Ref } from 'vue'
import type { HomeEditorCommandExecutor } from './homeEditorCommands'
import type { MuyaEditorExpose } from './homeEditorTypes'
import type { HomeSearchState } from './useHomeSearch'

export const createHomeEditorCommandExecutor = (
  search: Pick<HomeSearchState, 'openSearchPanel'>,
  muyaEditor: Ref<MuyaEditorExpose | null>
): HomeEditorCommandExecutor => ({
  openSearchPanel: search.openSearchPanel,
  undo: () => {
    muyaEditor.value?.undo()
  },
  redo: () => {
    muyaEditor.value?.redo()
  }
})
