import { describe, expect, it, vi } from 'vitest'
import {
  callNativeWindowClose,
  createMissingWindowAction,
  createWindowAction
} from './windowActionSupport'

describe('windowActionSupport', () => {
  it('creates a missing action that logs and runs fallback', async () => {
    const logError = vi.fn()
    const fallback = vi.fn()

    await createMissingWindowAction(logError, 'close', fallback)()

    expect(logError).toHaveBeenCalledWith('[modern] window close bridge is unavailable')
    expect(fallback).toHaveBeenCalledOnce()
  })

  it('prefers the provided window api method before creating a fallback action', async () => {
    const close = vi.fn(async () => {})
    const logError = vi.fn()

    const action = createWindowAction(
      { close } as never,
      'close',
      logError,
      'close'
    )

    await action()
    expect(close).toHaveBeenCalledOnce()
    expect(logError).not.toHaveBeenCalled()
  })

  it('calls the browser close fallback when available', () => {
    const runtimeWindow = ((globalThis as any).window ??= {})
    const originalClose = runtimeWindow.close
    const close = vi.fn()

    runtimeWindow.close = close
    callNativeWindowClose()

    expect(close).toHaveBeenCalledOnce()
    runtimeWindow.close = originalClose
  })
})
