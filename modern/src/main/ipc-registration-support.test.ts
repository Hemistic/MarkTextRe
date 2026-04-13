import { describe, expect, it, vi } from 'vitest'
import { registerIpcHandleMap } from './ipc-registration-support'

describe('ipc-registration-support', () => {
  it('registers each handler against its channel', () => {
    const handle = vi.fn()
    const first = vi.fn()
    const second = vi.fn()

    registerIpcHandleMap(handle, {
      'marktext:test:first': first,
      'marktext:test:second': second
    })

    expect(handle).toHaveBeenNthCalledWith(1, 'marktext:test:first', first)
    expect(handle).toHaveBeenNthCalledWith(2, 'marktext:test:second', second)
  })
})
