import { describe, expect, it, vi } from 'vitest'
import { startEditorWorkspaceRuntime } from './workspaceRuntimeBindings'
import type { AppCommandHandler } from '../../services/appCommands'

describe('workspace runtime bindings', () => {
  it('loads bootstrap and registers editor bindings with bridge status', () => {
    const cleanup = vi.fn()
    const loadBootstrap = vi.fn(async () => {})
    const registerEditorBindings = vi.fn(() => cleanup)
    const registerHandler = vi.fn((_handler: AppCommandHandler) => () => {})

    const unregister = startEditorWorkspaceRuntime({
      bridgeAvailable: true,
      editor: {
        loadBootstrap,
        createTab: vi.fn(),
        openDocument: vi.fn(async () => {}),
        openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
        openFolder: vi.fn(async () => {}),
        openFolderAtPath: vi.fn(async (_pathname: string) => true),
        saveActiveDocument: vi.fn(async () => {}),
        saveActiveDocumentAs: vi.fn(async () => {})
      },
      registerEditorBindings,
      registerHandler
    })

    expect(loadBootstrap).toHaveBeenCalledOnce()
    expect(registerEditorBindings).toHaveBeenCalledOnce()
    expect(registerEditorBindings).toHaveBeenCalledWith({
      bridgeAvailable: true,
      editor: expect.any(Object),
      registerAppCommandHandler: registerHandler
    })
    expect(unregister).toBe(cleanup)
  })
})
