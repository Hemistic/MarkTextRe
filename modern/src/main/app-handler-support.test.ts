import { describe, expect, it } from 'vitest'
import { createBootstrapPayload } from './app-handler-support'

describe('app-handler-support', () => {
  it('creates the renderer bootstrap payload from process metadata', () => {
    expect(createBootstrapPayload()).toEqual({
      appName: 'MarkText Modern',
      platform: process.platform,
      versions: {
        chrome: process.versions.chrome,
        electron: process.versions.electron,
        node: process.versions.node,
        v8: process.versions.v8
      }
    })
  })
})
