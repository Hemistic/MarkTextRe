import { describe, expect, it, vi } from 'vitest'
import { toggleWebContentsDevTools, toggleWindowMaximize } from './window-command-support'

describe('window-command-support', () => {
  it('toggles maximize state based on the current window state', () => {
    const maximizedWindow = {
      isMaximized: vi.fn(() => true),
      maximize: vi.fn(),
      unmaximize: vi.fn()
    }
    const normalWindow = {
      isMaximized: vi.fn(() => false),
      maximize: vi.fn(),
      unmaximize: vi.fn()
    }

    expect(toggleWindowMaximize(maximizedWindow)).toBe('unmaximized')
    expect(toggleWindowMaximize(normalWindow)).toBe('maximized')
    expect(maximizedWindow.unmaximize).toHaveBeenCalledOnce()
    expect(normalWindow.maximize).toHaveBeenCalledOnce()
  })

  it('toggles devtools only when webContents is live', () => {
    const opened = {
      isDestroyed: vi.fn(() => false),
      isDevToolsOpened: vi.fn(() => true),
      closeDevTools: vi.fn(),
      openDevTools: vi.fn()
    }
    const closed = {
      isDestroyed: vi.fn(() => false),
      isDevToolsOpened: vi.fn(() => false),
      closeDevTools: vi.fn(),
      openDevTools: vi.fn()
    }
    const destroyed = {
      isDestroyed: vi.fn(() => true),
      isDevToolsOpened: vi.fn(),
      closeDevTools: vi.fn(),
      openDevTools: vi.fn()
    }

    expect(toggleWebContentsDevTools(opened)).toBe(true)
    expect(toggleWebContentsDevTools(closed)).toBe(true)
    expect(toggleWebContentsDevTools(destroyed)).toBe(false)
    expect(toggleWebContentsDevTools(null)).toBe(false)
    expect(opened.closeDevTools).toHaveBeenCalledOnce()
    expect(closed.openDevTools).toHaveBeenCalledWith({ mode: 'detach' })
  })
})
