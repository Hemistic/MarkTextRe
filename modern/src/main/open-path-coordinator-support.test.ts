import { describe, expect, it, vi } from 'vitest'
import type { BrowserWindow } from 'electron'
import {
  activateOpenPathWindow,
  attachPendingOpenPathFlush,
  ensureOpenPathWindow,
  flushPendingOpenPathsToWindow
} from './open-path-coordinator-support'

const createWindow = ({
  isDestroyed = false,
  isLoadingMainFrame = false,
  isMinimized = false
}: {
  isDestroyed?: boolean
  isLoadingMainFrame?: boolean
  isMinimized?: boolean
} = {}) => {
  return {
    focus: vi.fn(),
    isDestroyed: vi.fn(() => isDestroyed),
    isMinimized: vi.fn(() => isMinimized),
    restore: vi.fn(),
    webContents: {
      isLoadingMainFrame: vi.fn(() => isLoadingMainFrame),
      once: vi.fn()
    }
  } as unknown as BrowserWindow
}

describe('open-path-coordinator-support', () => {
  it('flushes and clears pending open paths for a target window', () => {
    const pendingOpenPaths = ['a.md', 'b.md']
    const dispatchAppCommand = vi.fn()
    const window = createWindow()

    flushPendingOpenPathsToWindow(pendingOpenPaths, window, dispatchAppCommand)

    expect(dispatchAppCommand).toHaveBeenNthCalledWith(1, {
      command: 'open-path',
      pathname: 'a.md'
    }, window)
    expect(dispatchAppCommand).toHaveBeenNthCalledWith(2, {
      command: 'open-path',
      pathname: 'b.md'
    }, window)
    expect(pendingOpenPaths).toEqual([])
  })

  it('attaches a deferred flush while the renderer is still loading', () => {
    const window = createWindow({ isLoadingMainFrame: true })
    const flushPendingOpenPaths = vi.fn()

    attachPendingOpenPathFlush(window, flushPendingOpenPaths)

    expect(window.webContents.once).toHaveBeenCalledWith('did-finish-load', flushPendingOpenPaths)
    expect(flushPendingOpenPaths).not.toHaveBeenCalled()
  })

  it('flushes immediately once the target window is already loaded', () => {
    const window = createWindow()
    const flushPendingOpenPaths = vi.fn()

    attachPendingOpenPathFlush(window, flushPendingOpenPaths)

    expect(flushPendingOpenPaths).toHaveBeenCalledOnce()
  })

  it('reuses an existing live window before creating a new one', async () => {
    const window = createWindow()
    const createWindowMock = vi.fn(async () => createWindow())
    const setWindow = vi.fn()

    await expect(
      ensureOpenPathWindow(() => window, createWindowMock, setWindow)
    ).resolves.toBe(window)

    expect(createWindowMock).not.toHaveBeenCalled()
    expect(setWindow).not.toHaveBeenCalled()
  })

  it('creates and stores a new window when no live window exists', async () => {
    const nextWindow = createWindow()
    const createWindowMock = vi.fn(async () => nextWindow)
    const setWindow = vi.fn()

    await expect(
      ensureOpenPathWindow(() => null, createWindowMock, setWindow)
    ).resolves.toBe(nextWindow)

    expect(createWindowMock).toHaveBeenCalledOnce()
    expect(setWindow).toHaveBeenCalledWith(nextWindow)
  })

  it('restores minimized windows before focusing them', () => {
    const minimizedWindow = createWindow({ isMinimized: true })
    const normalWindow = createWindow()

    activateOpenPathWindow(minimizedWindow)
    activateOpenPathWindow(normalWindow)

    expect(minimizedWindow.restore).toHaveBeenCalledOnce()
    expect(minimizedWindow.focus).toHaveBeenCalledOnce()
    expect(normalWindow.restore).not.toHaveBeenCalled()
    expect(normalWindow.focus).toHaveBeenCalledOnce()
  })
})
