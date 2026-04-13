import { describe, expect, it, vi } from 'vitest'
import { createWindowActions } from './window'

describe('window actions', () => {
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
    const actions = createWindowActions(null, logError)

    await actions.closeWindow()
    await actions.toggleDevToolsWindow()

    expect(logError).toHaveBeenCalledWith('[modern] window close bridge is unavailable')
    expect(logError).toHaveBeenCalledWith('[modern] window toggle-dev-tools bridge is unavailable')
  })
})
