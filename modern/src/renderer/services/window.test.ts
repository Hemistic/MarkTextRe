import { describe, expect, it, vi } from 'vitest'
import { createWindowActions } from './window'

describe('window actions', () => {
  it('resolves the bridge lazily so late preload exposure still works', async () => {
    const runtimeWindow = ((globalThis as any).window ??= {})
    const originalMarkText = runtimeWindow.marktext
    const close = vi.fn(async () => {})
    const actions = createWindowActions(undefined)

    runtimeWindow.marktext = {
      window: {
        close,
        maximize: vi.fn(async () => {}),
        minimize: vi.fn(async () => {}),
        toggleDevTools: vi.fn(async () => {})
      }
    } as any

    await actions.closeWindow()
    expect(close).toHaveBeenCalledOnce()

    runtimeWindow.marktext = originalMarkText
  })

  it('delegates to the provided window api', async () => {
    const windowApi = {
      minimize: vi.fn(async () => {}),
      maximize: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
      toggleDevTools: vi.fn(async () => {})
    }

    const actions = createWindowActions(windowApi)

    await actions.minimizeWindow()
    await actions.maximizeWindow()
    await actions.closeWindow()
    await actions.toggleDevToolsWindow()

    expect(windowApi.minimize).toHaveBeenCalledOnce()
    expect(windowApi.maximize).toHaveBeenCalledOnce()
    expect(windowApi.close).toHaveBeenCalledOnce()
    expect(windowApi.toggleDevTools).toHaveBeenCalledOnce()
  })

  it('logs and no-ops when a bridge method is missing', async () => {
    const logError = vi.fn()
    const close = vi.fn()
    const runtimeWindow = ((globalThis as any).window ??= {})
    const originalClose = runtimeWindow.close
    runtimeWindow.close = close
    const actions = createWindowActions(null, logError)

    await actions.closeWindow()
    await actions.toggleDevToolsWindow()

    expect(logError).toHaveBeenCalledWith('[modern] window close bridge is unavailable')
    expect(logError).toHaveBeenCalledWith('[modern] window toggle-dev-tools bridge is unavailable')
    expect(close).toHaveBeenCalledOnce()

    runtimeWindow.close = originalClose
  })
})
