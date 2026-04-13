import { describe, expect, it, vi } from 'vitest'
import { createHomeViewActions } from './homeViewActions'

describe('home view actions', () => {
  it('delegates view actions to the editor store boundary', async () => {
    const editor = {
      closeTab: vi.fn(),
      createTab: vi.fn(),
      openDocument: vi.fn(async () => {}),
      openPath: vi.fn(async () => {}),
      openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
      openFolder: vi.fn(async () => {}),
      openFolderAtPath: vi.fn(async (_pathname: string) => true),
      openSampleDocument: vi.fn(),
      reopenRecentDocument: vi.fn(async (_pathname: string) => {}),
      saveActiveDocument: vi.fn(async () => {}),
      saveActiveDocumentAs: vi.fn(async () => {}),
      setActiveTab: vi.fn()
    }
    const windowActions = {
      closeWindow: vi.fn(async () => {}),
      maximizeWindow: vi.fn(async () => {}),
      minimizeWindow: vi.fn(async () => {}),
      toggleDevToolsWindow: vi.fn(async () => {})
    }

    const actions = createHomeViewActions(editor, windowActions)

    actions.selectTab('tab-1')
    actions.closeTab('tab-2')
    actions.createDocument()
    await actions.openPath()
    await actions.openDocument()
    await actions.openDocumentAtPath('D:/docs/from-tree.md')
    await actions.openFolder()
    await actions.openFolderAtPath('D:/docs')
    await actions.openRecentDocument('D:/docs/example.md')
    actions.openSampleDocument()
    await actions.saveDocument()
    await actions.saveDocumentAs()
    await actions.minimizeWindow()
    await actions.maximizeWindow()
    await actions.closeWindow()
    await actions.toggleDevToolsWindow()

    expect(editor.setActiveTab).toHaveBeenCalledWith('tab-1')
    expect(editor.closeTab).toHaveBeenCalledWith('tab-2')
    expect(editor.createTab).toHaveBeenCalledOnce()
    expect(editor.openPath).toHaveBeenCalledOnce()
    expect(editor.openDocument).toHaveBeenCalledOnce()
    expect(editor.openDocumentAtPath).toHaveBeenCalledWith('D:/docs/from-tree.md')
    expect(editor.openFolder).toHaveBeenCalledOnce()
    expect(editor.openFolderAtPath).toHaveBeenCalledWith('D:/docs')
    expect(editor.reopenRecentDocument).toHaveBeenCalledWith('D:/docs/example.md')
    expect(editor.openSampleDocument).toHaveBeenCalledOnce()
    expect(editor.saveActiveDocument).toHaveBeenCalledOnce()
    expect(editor.saveActiveDocumentAs).toHaveBeenCalledOnce()
    expect(windowActions.minimizeWindow).toHaveBeenCalledOnce()
    expect(windowActions.maximizeWindow).toHaveBeenCalledOnce()
    expect(windowActions.closeWindow).toHaveBeenCalledOnce()
    expect(windowActions.toggleDevToolsWindow).toHaveBeenCalledOnce()
  })
})
