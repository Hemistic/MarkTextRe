import {
  createWindowActions,
  type WindowActions
} from '../services/window'

interface HomeViewEditorStore {
  closeTab: (id: string) => void
  createTab: () => void
  openDocument: () => Promise<void>
  openSampleDocument: () => void
  reopenRecentDocument: (pathname: string) => Promise<void>
  saveActiveDocument: () => Promise<void>
  saveActiveDocumentAs: () => Promise<void>
  setActiveTab: (id: string) => void
}

interface HomeViewActionHooks {
  openSettingsPanel?: () => void
}

export interface HomeViewActions {
  closeTab: (id: string) => void
  closeWindow: () => Promise<void>
  createDocument: () => void
  maximizeWindow: () => Promise<void>
  minimizeWindow: () => Promise<void>
  openDocument: () => Promise<void>
  openRecentDocument: (pathname: string) => Promise<void>
  openSettings: () => void
  openSampleDocument: () => void
  saveDocument: () => Promise<void>
  saveDocumentAs: () => Promise<void>
  selectTab: (id: string) => void
  toggleDevToolsWindow: () => Promise<void>
}

export const createHomeViewActions = (
  editor: HomeViewEditorStore,
  windowActions: WindowActions = createWindowActions(),
  hooks: HomeViewActionHooks = {}
): HomeViewActions => ({
  closeTab: id => editor.closeTab(id),
  closeWindow: () => windowActions.closeWindow(),
  createDocument: () => editor.createTab(),
  maximizeWindow: () => windowActions.maximizeWindow(),
  minimizeWindow: () => windowActions.minimizeWindow(),
  openDocument: () => editor.openDocument(),
  openRecentDocument: pathname => editor.reopenRecentDocument(pathname),
  openSettings: () => {
    hooks.openSettingsPanel?.()
  },
  openSampleDocument: () => editor.openSampleDocument(),
  saveDocument: () => editor.saveActiveDocument(),
  saveDocumentAs: () => editor.saveActiveDocumentAs(),
  selectTab: id => editor.setActiveTab(id),
  toggleDevToolsWindow: () => windowActions.toggleDevToolsWindow()
})
