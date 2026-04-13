import { describe, expect, it, vi } from 'vitest'
import {
  createHomeEditorShortcutHandler,
  registerHomeEditorBindings
} from './homeEditorBindings'
import type { HomeEditorCommandExecutor } from './homeEditorCommands'

const createExecutor = (): HomeEditorCommandExecutor => ({
  openSearchPanel: vi.fn(async () => {}),
  redo: vi.fn(),
  undo: vi.fn()
})

describe('home editor bindings', () => {
  it('maps search and undo/redo shortcuts', async () => {
    const executor = createExecutor()
    const handler = createHomeEditorShortcutHandler(executor)

    const preventDefault = vi.fn()
    handler({
      key: 'f',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null,
      preventDefault
    } as unknown as KeyboardEvent)

    await Promise.resolve()
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(executor.openSearchPanel).toHaveBeenCalledOnce()

    handler({
      key: 'z',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null,
      preventDefault: vi.fn()
    } as unknown as KeyboardEvent)

    handler({
      key: 'y',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null,
      preventDefault: vi.fn()
    } as unknown as KeyboardEvent)

    handler({
      key: 'z',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: true,
      target: null,
      preventDefault: vi.fn()
    } as unknown as KeyboardEvent)

    expect(executor.undo).toHaveBeenCalledOnce()
    expect(executor.redo).toHaveBeenCalledTimes(2)
  })

  it('registers both keyboard and bridge bindings and cleans them up', async () => {
    const executor = createExecutor()
    const addWindowListener = vi.fn()
    const removeWindowListener = vi.fn()
    const unregister = vi.fn()
    const registerAppCommandHandler = vi.fn(handler => {
      void handler({ command: 'search' })
      return unregister
    })

    const cleanup = registerHomeEditorBindings({
      bridgeAvailable: true,
      executor,
      registerAppCommandHandler,
      addWindowListener,
      removeWindowListener
    })

    await Promise.resolve()
    expect(addWindowListener).toHaveBeenCalledOnce()
    expect(registerAppCommandHandler).toHaveBeenCalledOnce()
    expect(executor.openSearchPanel).toHaveBeenCalledOnce()

    const [, listener] = addWindowListener.mock.calls[0] ?? []
    cleanup()

    expect(unregister).toHaveBeenCalledOnce()
    expect(removeWindowListener).toHaveBeenCalledWith('keydown', listener)
  })
})
