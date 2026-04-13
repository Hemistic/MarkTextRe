import { describe, expect, it, vi } from 'vitest'
import { startHomeEditorCommandBindings } from './homeEditorCommandBindings'
import type { AppCommandHandler } from '../services/appCommands'

describe('home editor command bindings', () => {
  it('forwards bridge status and register handler to home bindings', () => {
    const cleanup = vi.fn()
    const registerBindings = vi.fn(() => cleanup)
    const registerHandler = vi.fn((_handler: AppCommandHandler) => () => {})
    const executor = {
      openSearchPanel: vi.fn(async () => {}),
      undo: vi.fn(),
      redo: vi.fn()
    }

    const unregister = startHomeEditorCommandBindings({
      bridgeAvailable: true,
      executor,
      registerBindings,
      registerHandler
    })

    expect(registerBindings).toHaveBeenCalledOnce()
    expect(registerBindings).toHaveBeenCalledWith({
      bridgeAvailable: true,
      executor,
      registerAppCommandHandler: registerHandler
    })
    expect(unregister).toBe(cleanup)
  })
})
