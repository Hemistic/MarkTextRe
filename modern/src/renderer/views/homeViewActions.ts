import {
  createWindowActions,
  type WindowActions
} from '../services/window'

interface HomeViewEditorStore {
  closeTab: (id: string) => void
  createTab: () => void
  openDocument: () => Promise<void>
  openPath: () => Promise<void>
  openDocumentAtPath: (pathname: string) => Promise<void>
  openFolder: () => Promise<void>
  openFolderAtPath: (pathname: string) => Promise<boolean>
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
  openPath: () => Promise<void>
  openDocument: () => Promise<void>
  openDocumentAtPath: (pathname: string) => Promise<void>
  openFolder: () => Promise<void>
  openFolderAtPath: (pathname: string) => Promise<boolean>
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
  openPath: () => editor.openPath(),
  openDocument: () => editor.openDocument(),
  openDocumentAtPath: pathname => editor.openDocumentAtPath(pathname),
  openFolder: () => editor.openFolder(),
  openFolderAtPath: pathname => editor.openFolderAtPath(pathname),
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
