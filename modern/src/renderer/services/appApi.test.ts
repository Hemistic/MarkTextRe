import type { MarkTextApi, MarkTextAppApi } from '@shared/contracts'
import { afterEach, describe, expect, it } from 'vitest'
import { getAppApi, withAppApi } from './appApi'

describe('appApi helper', () => {
  const originalWindowMarkText = (globalThis as any).window?.marktext
  const ensureWindow = () => {
    if (!(globalThis as any).window) {
      ;(globalThis as any).window = {}
    }
  }
  const setBridge = (bridge: MarkTextApi | null) => {
    ensureWindow()
    if (bridge) {
      ;(globalThis as any).window.marktext = bridge
      return
    }

    delete (globalThis as any).window.marktext
  }
  const stubApp: MarkTextAppApi = {
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
    confirmCloseDocument: async () => 'cancel',
    registerAppCommandHandler: () => () => undefined,
    registerWindowCloseCoordinator: () => undefined
  }
  const stubApi: MarkTextApi = {
    app: stubApp,
    files: {} as MarkTextApi['files'],
    settings: {} as MarkTextApi['settings'],
    window: {} as MarkTextApi['window']
  }

  afterEach(() => {
    setBridge(originalWindowMarkText ?? null)
  })

  it('returns null when the bridge is missing', () => {
    setBridge(null)
    expect(getAppApi()).toBeNull()
    expect(withAppApi(() => 'ok')).toBeNull()
  })

  it('runs callbacks when the bridge exists', () => {
    setBridge(stubApi)
    expect(getAppApi()).toBe(stubApp)
    expect(withAppApi(app => app)).toBe(stubApp)
    expect(withAppApi(() => 'ready')).toBe('ready')
  })
})
