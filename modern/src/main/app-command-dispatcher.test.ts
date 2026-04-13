import { describe, expect, it, vi } from 'vitest'
import type { BrowserWindow } from 'electron'
import {
  createLegacyMainCommandAdapter,
  dispatchRendererCommand
} from './app-command-dispatcher'

const createWindow = ({ isDestroyed = false }: { isDestroyed?: boolean } = {}) => {
  return {
    isDestroyed: vi.fn(() => isDestroyed),
    webContents: {
      send: vi.fn()
    }
  } as unknown as BrowserWindow
}

describe('app-command-dispatcher', () => {
  it('dispatches renderer commands to a live target window', () => {
    const window = createWindow()

    const result = dispatchRendererCommand({
      command: 'save-file'
    }, () => window)

    expect(result).toBe(true)
    expect(window.webContents.send).toHaveBeenCalledWith(
      'marktext:app:command',
      { command: 'save-file' }
    )
  })

  it('does not dispatch when no target window is available', () => {
    const result = dispatchRendererCommand({ command: 'undo' }, () => null)
    expect(result).toBe(false)
  })

  it('does not dispatch when target window is destroyed', () => {
    const result = dispatchRendererCommand({ command: 'redo' }, () => createWindow({ isDestroyed: true }))
    expect(result).toBe(false)
  })

  it('creates a legacy command adapter for app commands and open-path', () => {
    const dispatchCommand = vi.fn()
    const targetWindow = createWindow()
    const adapter = createLegacyMainCommandAdapter(dispatchCommand)

    adapter.dispatchAppCommand('search')
    adapter.dispatchOpenPath('/docs/notes.md', targetWindow)

    expect(dispatchCommand).toHaveBeenNthCalledWith(1, { command: 'search' })
    expect(dispatchCommand).toHaveBeenNthCalledWith(2, {
      command: 'open-path',
      pathname: '/docs/notes.md'
    }, expect.any(Function))

    const openPathResolver = dispatchCommand.mock.calls[1]?.[1] as (() => BrowserWindow | null)
    expect(openPathResolver()).toBe(targetWindow)
  })
})

