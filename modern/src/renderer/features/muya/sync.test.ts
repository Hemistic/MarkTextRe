import { describe, expect, it, vi } from 'vitest'
import {
  createMuyaSyncState,
  handleMuyaChange,
  restoreMuyaFromModel,
  shouldSyncMuyaFromModel
} from './sync'

describe('muya sync', () => {
  it('skips model sync when the editor already reflects the latest markdown', () => {
    const state = createMuyaSyncState('# Demo')

    expect(shouldSyncMuyaFromModel(null, '# Changed', state)).toBe(false)
    expect(shouldSyncMuyaFromModel({} as never, '# Demo', state)).toBe(false)
    expect(shouldSyncMuyaFromModel({} as never, '# Changed', state)).toBe(true)
  })

  it('marks external updates so change echo is suppressed until reset', () => {
    const state = createMuyaSyncState('# Old')
    const setMarkdown = vi.fn()
    const setHistory = vi.fn()
    const resetCallbacks: Array<() => void> = []

    restoreMuyaFromModel({
      setMarkdown,
      setHistory,
      on: vi.fn()
    }, state, '# New', { start: 2 }, { undo: [] }, callback => {
      resetCallbacks.push(callback)
    })

    expect(state.applyingExternalUpdate).toBe(true)
    expect(state.lastMarkdown).toBe('# New')
    expect(setMarkdown).toHaveBeenCalledWith('# New', { start: 2 }, true)
    expect(setHistory).toHaveBeenCalledWith({ undo: [] })

    resetCallbacks[0]?.()
    expect(state.applyingExternalUpdate).toBe(false)
  })

  it('updates last markdown and emits model changes only for user edits', () => {
    const state = createMuyaSyncState('# Before')

    const duringExternalSync = handleMuyaChange(state, { markdown: '# During Sync' }, '# Before')
    expect(duringExternalSync.shouldEmitModelUpdate).toBe(true)

    state.applyingExternalUpdate = true
    const suppressed = handleMuyaChange(state, { markdown: '# External Echo' }, '# Before')
    expect(suppressed.shouldEmitModelUpdate).toBe(false)

    state.applyingExternalUpdate = false
    const unchanged = handleMuyaChange(state, { markdown: '# External Echo' }, '# External Echo')
    expect(unchanged.shouldEmitModelUpdate).toBe(false)
  })
})
