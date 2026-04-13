import { describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exposeMarkTextApi } = require('./preload-support.cjs')

describe('preload-support', () => {
  it('creates and exposes the marktext api in the main world', () => {
    const api = { app: {}, files: {}, settings: {}, window: {} }
    const contextBridge = {
      exposeInMainWorld: vi.fn()
    }
    const createMarkTextApi = vi.fn(() => api)
    const ipcRenderer = {}

    const result = exposeMarkTextApi({ contextBridge, createMarkTextApi, ipcRenderer })

    expect(createMarkTextApi).toHaveBeenCalledWith(ipcRenderer)
    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('marktext', api)
    expect(result).toBe(api)
  })
})
