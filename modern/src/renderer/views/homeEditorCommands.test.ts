import { describe, expect, it, vi } from 'vitest'
import {
  executeHomeEditorAppCommand,
  isTextInputTarget,
  mapKeyboardEventToHomeEditorCommand
} from './homeEditorCommands'

const createExecutor = () => ({
  openSearchPanel: vi.fn(async () => {}),
  redo: vi.fn(),
  undo: vi.fn()
})

const createInputLikeTarget = () => ({
  isContentEditable: false,
  closest: vi.fn((selector: string) => selector === 'input, textarea, select' ? {} : null)
}) as unknown as EventTarget

const createEditableTarget = () => ({
  isContentEditable: true,
  closest: vi.fn(() => null)
}) as unknown as EventTarget

describe('home editor commands', () => {
  it('detects native input targets but ignores contenteditable nodes', () => {
    const input = createInputLikeTarget()
    const editable = createEditableTarget()

    expect(isTextInputTarget(input)).toBe(true)
    expect(isTextInputTarget(editable)).toBe(false)
    expect(isTextInputTarget(null)).toBe(false)
  })

  it('maps supported keyboard shortcuts to app commands', () => {
    expect(mapKeyboardEventToHomeEditorCommand({
      key: 'f',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null
    } as unknown as KeyboardEvent)).toEqual({ command: 'search' })

    expect(mapKeyboardEventToHomeEditorCommand({
      key: 'z',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null
    } as unknown as KeyboardEvent)).toEqual({ command: 'undo' })

    expect(mapKeyboardEventToHomeEditorCommand({
      key: 'z',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: true,
      target: null
    } as unknown as KeyboardEvent)).toEqual({ command: 'redo' })

    expect(mapKeyboardEventToHomeEditorCommand({
      key: 'y',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: null
    } as unknown as KeyboardEvent)).toEqual({ command: 'redo' })
  })

  it('ignores undo/redo shortcuts while a native input has focus', () => {
    expect(mapKeyboardEventToHomeEditorCommand({
      key: 'z',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: createInputLikeTarget()
    } as unknown as KeyboardEvent)).toBeNull()
  })

  it('executes supported commands', async () => {
    const executor = createExecutor()

    await executeHomeEditorAppCommand(executor, { command: 'undo' })
    await executeHomeEditorAppCommand(executor, { command: 'redo' })
    await executeHomeEditorAppCommand(executor, { command: 'search' })
    await executeHomeEditorAppCommand(executor, { command: 'save-file' })

    expect(executor.undo).toHaveBeenCalledOnce()
    expect(executor.redo).toHaveBeenCalledOnce()
    expect(executor.openSearchPanel).toHaveBeenCalledOnce()
  })
})
