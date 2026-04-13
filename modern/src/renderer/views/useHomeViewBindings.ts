import type { Ref } from 'vue'
import type { HomeViewActions } from './homeViewActions'
import type { EditorWorkspaceViewState } from '../features/editor/workspaceViewSupport'
import type { HomeSearchState } from './useHomeSearch'
import type { MuyaEditorExpose, SidebarExpose } from './homeEditorTypes'
import {
  createEditorBindings,
  createHomeFlags,
  createHomeRefs,
  createRecentBindings,
  createSidebarBindings,
  createTabsBindings,
  createTitleBarBindings
} from './homeViewBindingFactory'

interface UseHomeViewBindingsInput {
  actions: HomeViewActions
  muyaEditor: Ref<MuyaEditorExpose | null>
  search: HomeSearchState
  sideBar: Ref<SidebarExpose | null>
  view: EditorWorkspaceViewState
}

export const useHomeViewBindings = ({
  actions,
  muyaEditor,
  search,
  sideBar,
  view
}: UseHomeViewBindingsInput) => {
  const editorBindings = createEditorBindings({
    view,
    search
  })
  const sidebarBindings = createSidebarBindings({
    actions,
    search,
    view
  })
  const tabsBindings = createTabsBindings({
    actions,
    view
  })
  const titleBarBindings = createTitleBarBindings({
    actions,
    view
  })
  const recentBindings = createRecentBindings({
    actions,
    view
  })
  const flags = createHomeFlags({ view })
  const refs = createHomeRefs({
    muyaEditor,
    sideBar
  })

  return {
    editorHandlers: editorBindings.handlers,
    editorProps: editorBindings.props,
    flags,
    refs,
    recentHandlers: recentBindings.handlers,
    recentProps: recentBindings.props,
    sidebarHandlers: sidebarBindings.handlers,
    sidebarProps: sidebarBindings.props,
    tabsHandlers: tabsBindings.handlers,
    tabsProps: tabsBindings.props,
    titleBarHandlers: titleBarBindings.handlers,
    titleBarProps: titleBarBindings.props
  }
}
