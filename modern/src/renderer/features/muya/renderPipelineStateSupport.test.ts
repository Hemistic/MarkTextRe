import { describe, expect, it, vi } from 'vitest'
import {
  canRenderRange,
  createEmptySearchMatches,
  getRenderState,
  prepareRenderContext,
  resolveRenderIndices
} from './legacySupportTestApi'

const createStateRender = () => ({
  collectLabels: vi.fn(),
  render: vi.fn(),
  partialRender: vi.fn(),
  singleRender: vi.fn()
})

describe('muya renderPipelineStateSupport', () => {
  it('creates the default empty search match state', () => {
    expect(createEmptySearchMatches()).toEqual({
      matches: [],
      index: -1
    })
  })

  it('returns null when the content state render runtime is destroyed', () => {
    const contentState = {
      runtime: {
        destroyed: true
      },
      stateRender: createStateRender()
    }

    expect(getRenderState(contentState)).toBe(null)
  })

  it('prepares render context and marks the active search match', () => {
    const stateRender = createStateRender()
    const renderBlock = { key: 'render-block' }
    const activeBlocks = [{ key: 'b' }]
    const matches = [{ key: 'm1' }, { key: 'm2' }]
    const contentState = {
      runtime: {
        destroyed: false
      },
      stateRender,
      blocks: [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
      searchMatches: {
        matches,
        index: 1
      },
      getActiveBlocks: vi.fn().mockReturnValue(activeBlocks)
    }

    const context = prepareRenderContext(contentState, renderBlock)

    expect(context).toEqual({
      stateRender,
      blocks: contentState.blocks,
      activeBlocks,
      matches
    })
    expect(contentState.getActiveBlocks).toHaveBeenCalledWith(renderBlock)
    expect(matches[0]).toMatchObject({ active: false })
    expect(matches[1]).toMatchObject({ active: true })
  })

  it('resolves render indices from optional start and end keys', () => {
    const blocks = [{ key: 'a' }, { key: 'b' }, { key: 'c' }]

    expect(resolveRenderIndices(blocks, 'b', 'c')).toEqual([1, 3])
    expect(resolveRenderIndices(blocks, 'missing', 'missing')).toEqual([0, 3])
    expect(resolveRenderIndices(blocks, undefined, 'b')).toEqual([0, 2])
  })

  it('rejects stale partial render ranges when keys are gone', () => {
    const blocks = [{ key: 'a' }, { key: 'b' }, { key: 'c' }]

    expect(canRenderRange(blocks, 'a', 'c')).toBe(true)
    expect(canRenderRange(blocks, 'missing', 'c')).toBe(false)
    expect(canRenderRange(blocks, 'a', 'missing')).toBe(false)
  })
})
