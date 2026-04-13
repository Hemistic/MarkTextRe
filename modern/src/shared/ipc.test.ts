import { describe, expect, it } from 'vitest'
import { MAIN_IPC_CHANNELS } from '../main/ipc-contract'
import { IPC_CHANNELS } from './ipc'

// Keep preload and ts callers on the same IPC source of truth.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { IPC_CHANNELS: preloadIPCChannels } = require('../preload/ipc-contract.cjs')

describe('ipc channels', () => {
  it('freezes the shared IPC channel contract', () => {
    expect(Object.isFrozen(IPC_CHANNELS)).toBe(true)
  })

  it('keeps the main TS seam aligned with the shared IPC source', () => {
    expect(MAIN_IPC_CHANNELS).toEqual(IPC_CHANNELS)
  })

  it('keeps the preload CJS bridge aligned with the shared IPC source', () => {
    expect(preloadIPCChannels).toEqual(IPC_CHANNELS)
  })
})
