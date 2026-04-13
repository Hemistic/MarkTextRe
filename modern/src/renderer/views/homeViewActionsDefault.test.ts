import { describe, expect, it, vi } from 'vitest'

const mockedWindowModule = vi.hoisted(() => {
  const windowActions = {
    closeWindow: vi.fn(async () => {}),
    maximizeWindow: vi.fn(async () => {}),
    minimizeWindow: vi.fn(async () => {}),
    toggleDevToolsWindow: vi.fn(async () => {})
  }

  return {
    windowActions,
    createWindowActions: vi.fn(() => windowActions)
  }
})

vi.mock('../services/window', () => ({
  createWindowActions: mockedWindowModule.createWindowActions,
  closeWindow: vi.fn(async () => {}),
  maximizeWindow: vi.fn(async () => {}),
  minimizeWindow: vi.fn(async () => {}),
  toggleDevToolsWindow: vi.fn(async () => {})
}))

import { createHomeViewActions } from './homeViewActions'

describe('home view actions default window actions', () => {
  it('uses the default renderer window action layer when none is provided', async () => {
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

    const actions = createHomeViewActions(editor)
    await actions.closeWindow()
    await actions.toggleDevToolsWindow()

    expect(mockedWindowModule.createWindowActions).toHaveBeenCalledOnce()
    expect(mockedWindowModule.windowActions.closeWindow).toHaveBeenCalledOnce()
    expect(mockedWindowModule.windowActions.toggleDevToolsWindow).toHaveBeenCalledOnce()
  })
})
