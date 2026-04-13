import { beforeEach, describe, expect, it, vi } from 'vitest'

const { ensureLegacyVegaGlobals } = vi.hoisted(() => ({
  ensureLegacyVegaGlobals: vi.fn()
}))

vi.mock('../renderer/services/legacyScripts', () => ({
  ensureLegacyVegaGlobals
}))

import embed from './vegaEmbed'

describe('vegaEmbed shim', () => {
  beforeEach(() => {
    ensureLegacyVegaGlobals.mockReset()
  })

  it('loads the legacy vega renderer before delegating the embed call', async () => {
    const renderResult = { view: { id: 'preview' } }
    const renderer = vi.fn().mockResolvedValue(renderResult)
    const spec = {
      mark: 'bar'
    }
    const options = {
      actions: false
    }

    ensureLegacyVegaGlobals.mockResolvedValue(renderer)

    const result = await embed('#chart', spec, options)

    expect(ensureLegacyVegaGlobals).toHaveBeenCalledTimes(1)
    expect(renderer).toHaveBeenCalledWith('#chart', spec, options)
    expect(result).toBe(renderResult)
  })
})
