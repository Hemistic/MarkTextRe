import { describe, expect, it, vi } from 'vitest'
import {
  executeEditorAppCommand,
  mapKeyboardEventToAppCommand
} from './app-commands'

const createKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => ({
  key: '',
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...overrides
} as KeyboardEvent)

describe('app commands', () => {
  it('maps common editor shortcuts to app commands', () => {
    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 'n',
      ctrlKey: true
    }))).toEqual({ command: 'new-file' })

    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 'o',
      metaKey: true
    }))).toEqual({ command: 'open-file' })

    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 's',
      ctrlKey: true
    }))).toEqual({ command: 'save-file' })

    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 'S',
      ctrlKey: true,
      shiftKey: true
    }))).toEqual({ command: 'save-file-as' })
  })

  it('ignores shortcuts without the primary modifier or with alt pressed', () => {
    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 's'
    }))).toBeNull()

    expect(mapKeyboardEventToAppCommand(createKeyboardEvent({
      key: 's',
      ctrlKey: true,
      altKey: true
    }))).toBeNull()
  })

  it('dispatches commands to the matching editor action', async () => {
    const editor = {
      createTab: vi.fn(),
      openDocument: vi.fn(async () => {}),
      openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
      saveActiveDocument: vi.fn(async () => {}),
      saveActiveDocumentAs: vi.fn(async () => {})
    }

    await executeEditorAppCommand(editor, { command: 'new-file' })
    await executeEditorAppCommand(editor, { command: 'open-file' })
    await executeEditorAppCommand(editor, { command: 'open-path', pathname: 'D:/docs/example.md' })
    await executeEditorAppCommand(editor, { command: 'save-file' })
    await executeEditorAppCommand(editor, { command: 'save-file-as' })

    expect(editor.createTab).toHaveBeenCalledOnce()
    expect(editor.openDocument).toHaveBeenCalledOnce()
    expect(editor.openDocumentAtPath).toHaveBeenCalledWith('D:/docs/example.md')
    expect(editor.saveActiveDocument).toHaveBeenCalledOnce()
    expect(editor.saveActiveDocumentAs).toHaveBeenCalledOnce()
  })

  it('ignores open-path commands that do not include a pathname', async () => {
    const editor = {
      createTab: vi.fn(),
      openDocument: vi.fn(async () => {}),
      openDocumentAtPath: vi.fn(async (_pathname: string) => {}),
      saveActiveDocument: vi.fn(async () => {}),
      saveActiveDocumentAs: vi.fn(async () => {})
    }

    await executeEditorAppCommand(editor, { command: 'open-path' })

    expect(editor.openDocumentAtPath).not.toHaveBeenCalled()
  })
})
