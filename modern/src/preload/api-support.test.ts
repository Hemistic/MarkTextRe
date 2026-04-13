import { describe, expect, it } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { freezeMarkTextApi } = require('./api-support.cjs')

describe('api-support', () => {
  it('freezes the top-level preload api and each namespace', () => {
    const api = freezeMarkTextApi({
      app: { getBootstrap: () => null },
      files: { openMarkdown: () => null },
      settings: { getState: () => null },
      window: { close: () => null }
    })

    expect(Object.isFrozen(api)).toBe(true)
    expect(Object.isFrozen(api.app)).toBe(true)
    expect(Object.isFrozen(api.files)).toBe(true)
    expect(Object.isFrozen(api.settings)).toBe(true)
    expect(Object.isFrozen(api.window)).toBe(true)
  })
})
