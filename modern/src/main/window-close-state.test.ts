import { describe, expect, it } from 'vitest'
import { createWindowCloseState } from './window-close-state'

describe('window-close-state', () => {
  it('allows native close when the window is clean or already closing', () => {
    const state = createWindowCloseState()

    expect(state.shouldAllowNativeClose(1)).toBe(true)

    state.setDirtyState(1, true)
    expect(state.shouldAllowNativeClose(1)).toBe(false)

    state.markClosing(1)
    expect(state.shouldAllowNativeClose(1)).toBe(true)
  })

  it('tracks pending close requests per window', () => {
    const state = createWindowCloseState()

    expect(state.beginPendingClose(7)).toBe(true)
    expect(state.beginPendingClose(7)).toBe(false)

    state.finishPendingClose(7)
    expect(state.beginPendingClose(7)).toBe(true)
  })

  it('cleans all tracked state when a window closes', () => {
    const state = createWindowCloseState()

    state.setDirtyState(3, true)
    state.markClosing(3)
    state.beginPendingClose(3)
    state.cleanupWindow(3)

    expect(state.hasDirtyDocuments(3)).toBe(false)
    expect(state.shouldAllowNativeClose(3)).toBe(true)
    expect(state.beginPendingClose(3)).toBe(true)
  })
})
