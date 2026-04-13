import type { MarkTextAppApi } from '@shared/contracts'
import { describe, expect, it, vi } from 'vitest'
import {
  attachWindowCloseCoordinator,
  registerAppCommandHandlerWithFallback,
  resolveCloseDocumentAction
} from './appCommandSupport'

const createStubApp = (): MarkTextAppApi => ({
  getBootstrap: async () => ({
    appName: 'MarkText',
    platform: 'win32',
    versions: {
      chrome: '0',
      electron: '0',
      node: '0',
      v8: '0'
    }
  }),
  setDirtyState: async () => undefined,
  getSessionState: async () => null,
  setSessionState: async () => undefined,
  confirmCloseDocument: async () => 'discard',
  registerAppCommandHandler: () => () => undefined,
  registerWindowCloseCoordinator: () => undefined
})

describe('appCommandSupport', () => {
  it('uses the app bridge for close confirmation when available', async () => {
    const app = createStubApp()
    app.confirmCloseDocument = vi.fn().mockResolvedValue('save')

    await expect(resolveCloseDocumentAction(app, 'demo.md')).resolves.toBe('save')
    expect(app.confirmCloseDocument).toHaveBeenCalledWith('demo.md')
  })

  it('falls back to browser confirm when the app bridge is missing', async () => {
    const confirmClose = vi.fn().mockReturnValue(true)

    await expect(resolveCloseDocumentAction(null, 'demo.md', confirmClose)).resolves.toBe('discard')
    expect(confirmClose).toHaveBeenCalledWith('Close demo.md without saving?')
  })

  it('registers optional coordinator and handler hooks safely', () => {
    const unregister = vi.fn()
    const registerWindowCloseCoordinator = vi.fn()
    const registerAppCommandHandler = vi.fn().mockReturnValue(unregister)
    const app = createStubApp()
    app.registerWindowCloseCoordinator = registerWindowCloseCoordinator
    app.registerAppCommandHandler = registerAppCommandHandler
    const coordinator = {
      canCloseWindow: vi.fn(),
      getDirtyDocuments: vi.fn().mockReturnValue([]),
      saveAllDirtyDocuments: vi.fn().mockResolvedValue(true)
    }
    const handler = vi.fn()

    attachWindowCloseCoordinator(app, coordinator)
    expect(registerWindowCloseCoordinator).toHaveBeenCalledWith(coordinator)

    expect(registerAppCommandHandlerWithFallback(app, handler)).toBe(unregister)
    expect(registerAppCommandHandler).toHaveBeenCalledWith(handler)
    expect(typeof registerAppCommandHandlerWithFallback(null, handler)).toBe('function')
  })
})
