import { describe, expect, it, vi } from 'vitest'
import {
  createEditSubmenu,
  createFileSubmenu
} from './menu-section-support'

const createAppCommandMenuItem = (
  command: string,
  dispatchCommand: (command: string) => void
) => ({
  label: command,
  click: () => dispatchCommand(command)
})

describe('menu-section-support', () => {
  it('creates the file submenu with recent files and save commands', () => {
    const dispatchAppCommand = vi.fn()
    const items = createFileSubmenu(
      [{ label: 'notes.md' }],
      false,
      createAppCommandMenuItem as never,
      dispatchAppCommand
    )

    expect(items[3]).toEqual({
      label: 'Open Recent',
      submenu: [{ label: 'notes.md' }]
    })

    items[0]?.click?.(undefined as never, undefined as never, undefined as never)
    items[5]?.click?.(undefined as never, undefined as never, undefined as never)

    expect(dispatchAppCommand).toHaveBeenNthCalledWith(1, 'new-file')
    expect(dispatchAppCommand).toHaveBeenNthCalledWith(2, 'save-file')
  })

  it('creates the edit submenu with undo redo and search commands', () => {
    const dispatchAppCommand = vi.fn()
    const items = createEditSubmenu(
      createAppCommandMenuItem as never,
      dispatchAppCommand
    )

    items[0]?.click?.(undefined as never, undefined as never, undefined as never)
    items[1]?.click?.(undefined as never, undefined as never, undefined as never)
    items[3]?.click?.(undefined as never, undefined as never, undefined as never)

    expect(dispatchAppCommand).toHaveBeenNthCalledWith(1, 'undo')
    expect(dispatchAppCommand).toHaveBeenNthCalledWith(2, 'redo')
    expect(dispatchAppCommand).toHaveBeenNthCalledWith(3, 'search')
  })
})
