import { describe, expect, it, vi } from 'vitest'
import {
  createEditorKeyboardHandler,
  registerEditorCommandBindings
} from './workspaceBindings'

const createEditor = () => ({
  createTab: vi.fn(),
  openDocument: vi.fn(async () => {}),
  openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
  saveActiveDocument: vi.fn(async () => {}),
  saveActiveDocumentAs: vi.fn(async () => {})
})

describe('workspace bindings', () => {
  it('binds keyboard shortcuts in browser mode and cleans them up', () => {
    const editor = createEditor()
    const addWindowListener = vi.fn()
    const removeWindowListener = vi.fn()

    const cleanup = registerEditorCommandBindings({
      editor,
      bridgeAvailable: false,
      registerAppCommandHandler: vi.fn(() => () => {}),
      addWindowListener,
      removeWindowListener
    })

    expect(addWindowListener).toHaveBeenCalledOnce()
    const [, handler] = addWindowListener.mock.calls[0] ?? []
    expect(typeof handler).toBe('function')

    cleanup()

    expect(removeWindowListener).toHaveBeenCalledOnce()
    expect(removeWindowListener).toHaveBeenCalledWith('keydown', handler)
  })

  it('registers app command handlers when the Electron bridge is available', async () => {
    const editor = createEditor()
    const unregister = vi.fn()
    const registerAppCommandHandler = vi.fn(handler => {
      void handler({ command: 'save-file' })
      return unregister
    })

    const cleanup = registerEditorCommandBindings({
      editor,
      bridgeAvailable: true,
      registerAppCommandHandler
    })

    expect(registerAppCommandHandler).toHaveBeenCalledOnce()
    await Promise.resolve()
    expect(editor.saveActiveDocument).toHaveBeenCalledOnce()

    cleanup()
    expect(unregister).toHaveBeenCalledOnce()
  })

  it('prevents default when a mapped keyboard shortcut is pressed', async () => {
    const editor = createEditor()
    const preventDefault = vi.fn()
    const handler = createEditorKeyboardHandler(editor)

    handler({
      key: 's',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      preventDefault
    } as unknown as KeyboardEvent)

    await Promise.resolve()
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(editor.saveActiveDocument).toHaveBeenCalledOnce()
  })

  it('ignores unmapped keyboard input', () => {
    const editor = createEditor()
    const preventDefault = vi.fn()
    const handler = createEditorKeyboardHandler(editor)

    handler({
      key: 'x',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      preventDefault
    } as unknown as KeyboardEvent)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(editor.saveActiveDocument).not.toHaveBeenCalled()
  })
})
