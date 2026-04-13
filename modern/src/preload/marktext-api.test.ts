import { describe, expect, it, vi } from 'vitest'
import { IPC_CHANNELS } from '../shared/ipc'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createMarkTextApi } = require('./marktext-api.cjs')

describe('marktext preload api', () => {
  it('routes app, file, and window calls through the matching IPC channels', async () => {
    const ipcRenderer = {
      invoke: vi.fn(async () => null),
      on: vi.fn(),
      send: vi.fn()
    }

    const api = createMarkTextApi(ipcRenderer)

    await api.app.getBootstrap()
    await api.files.openMarkdownAtPath('D:/docs/example.md')
    await api.files.pickImage()
    await api.window.toggleDevTools()

    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(1, IPC_CHANNELS.app.getBootstrap)
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(2, IPC_CHANNELS.files.openMarkdownAtPath, 'D:/docs/example.md')
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(3, IPC_CHANNELS.files.pickImage)
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(4, IPC_CHANNELS.window.toggleDevTools)
    expect(Object.isFrozen(api)).toBe(true)
    expect(Object.isFrozen(api.app)).toBe(true)
  })

  it('wires command subscriptions and close coordination once through ipcRenderer', async () => {
    const listeners = new Map<string, Function>()
    const ipcRenderer = {
      invoke: vi.fn(async () => null),
      on: vi.fn((channel: string, handler: Function) => {
        listeners.set(channel, handler)
      }),
      send: vi.fn()
    }

    const api = createMarkTextApi(ipcRenderer)
    const appCommandHandler = vi.fn()
    const unregister = api.app.registerAppCommandHandler(appCommandHandler)

    const coordinator = {
      getDirtyDocuments: vi.fn(async () => [{ id: '1', filename: 'example.md' }]),
      saveAllDirtyDocuments: vi.fn(async () => true)
    }
    api.app.registerWindowCloseCoordinator(coordinator)

    listeners.get(IPC_CHANNELS.app.command)?.({}, { command: 'save-file' })
    expect(appCommandHandler).toHaveBeenCalledWith({ command: 'save-file' })

    unregister()
    listeners.get(IPC_CHANNELS.app.command)?.({}, { command: 'open-file' })
    expect(appCommandHandler).toHaveBeenCalledTimes(1)

    await listeners.get(IPC_CHANNELS.app.windowCloseRequest)?.({}, {
      requestId: 'req-1',
      kind: 'get-dirty-documents'
    })

    expect(coordinator.getDirtyDocuments).toHaveBeenCalledOnce()
    expect(ipcRenderer.send).toHaveBeenCalledWith(IPC_CHANNELS.app.windowCloseResponse, {
      requestId: 'req-1',
      dirtyDocuments: [{ id: '1', filename: 'example.md' }],
      ok: true
    })
  })
})
