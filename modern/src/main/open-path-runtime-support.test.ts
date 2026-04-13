import { describe, expect, it, vi } from 'vitest'
import type { App, BrowserWindow } from 'electron'
import {
  captureStartupOpenPaths,
  queueOpenPathForApp,
  registerOpenPathAppEvents
} from './open-path-runtime-support'

describe('open-path-runtime-support', () => {
  it('queues paths without opening windows until the app is ready', () => {
    const pendingOpenPaths: string[] = []
    const enqueuePath = vi.fn((queue: string[], pathname: string) => {
      queue.push(pathname)
    })
    const ensureWindow = vi.fn(async () => ({} as BrowserWindow))
    const activateWindow = vi.fn()
    const attachWindow = vi.fn()

    queueOpenPathForApp(pendingOpenPaths, 'a.md', {
      activateWindow,
      appReady: () => false,
      attachWindow,
      ensureWindow,
      enqueuePath
    })

    expect(pendingOpenPaths).toEqual(['a.md'])
    expect(ensureWindow).not.toHaveBeenCalled()
    expect(activateWindow).not.toHaveBeenCalled()
    expect(attachWindow).not.toHaveBeenCalled()
  })

  it('activates and attaches a window once the app is ready', async () => {
    const pendingOpenPaths: string[] = []
    const window = {} as BrowserWindow
    const enqueuePath = vi.fn((queue: string[], pathname: string) => {
      queue.push(pathname)
    })
    const ensureWindow = vi.fn(async () => window)
    const activateWindow = vi.fn()
    const attachWindow = vi.fn()

    queueOpenPathForApp(pendingOpenPaths, 'b.md', {
      activateWindow,
      appReady: () => true,
      attachWindow,
      ensureWindow,
      enqueuePath
    })

    await Promise.resolve()

    expect(pendingOpenPaths).toEqual(['b.md'])
    expect(ensureWindow).toHaveBeenCalledOnce()
    expect(activateWindow).toHaveBeenCalledWith(window)
    expect(attachWindow).toHaveBeenCalledWith(window)
  })

  it('captures startup paths into the pending queue', async () => {
    const pendingOpenPaths: string[] = []
    const enqueuePath = vi.fn((queue: string[], pathname: string) => {
      queue.push(pathname)
    })
    const extractOpenablePaths = vi.fn(async () => ['a.md', 'b.md'])

    await captureStartupOpenPaths(['a.md'], pendingOpenPaths, {
      enqueuePath,
      extractOpenablePaths
    })

    expect(extractOpenablePaths).toHaveBeenCalledWith(['a.md'])
    expect(pendingOpenPaths).toEqual(['a.md', 'b.md'])
  })

  it('registers second-instance and open-file handlers against the app', async () => {
    const handlers = new Map<string, (...args: unknown[]) => void>()
    const app = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler)
      })
    }
    const queueOpenPath = vi.fn()
    const extractOpenablePaths = vi.fn(async () => ['c.md', 'd.md'])

    registerOpenPathAppEvents(app as unknown as Pick<App, 'on'>, {
      extractOpenablePaths,
      queueOpenPath
    })

    const preventDefault = vi.fn()
    handlers.get('open-file')?.({ preventDefault }, 'note.md')
    await handlers.get('second-instance')?.({}, ['c.md'])

    await Promise.resolve()

    expect(extractOpenablePaths).toHaveBeenCalledWith(['c.md'])
    expect(queueOpenPath).toHaveBeenNthCalledWith(1, 'note.md')
    expect(queueOpenPath).toHaveBeenNthCalledWith(2, 'c.md')
    expect(queueOpenPath).toHaveBeenNthCalledWith(3, 'd.md')
    expect(preventDefault).toHaveBeenCalledOnce()
  })
})
