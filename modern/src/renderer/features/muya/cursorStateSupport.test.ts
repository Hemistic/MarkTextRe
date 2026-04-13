import { describe, expect, it, vi } from 'vitest'
// @ts-ignore legacy Muya support is JS-backed on purpose.
import {
  hasCursorEdgeKey,
  hasCursorRangeKeys,
  normalizeCursorRange,
  resolveActiveCursorRange,
  resolveCursorRangeBlocks
} from './legacyCursorStateSupportTestApi'

describe('muya cursorStateSupport', () => {
  it('validates cursor edges and ranges before block lookups', () => {
    expect(hasCursorEdgeKey(null)).toBe(false)
    expect(hasCursorEdgeKey({})).toBe(false)
    expect(hasCursorEdgeKey({ key: 'a' })).toBe(true)
    expect(hasCursorRangeKeys(null)).toBe(false)
    expect(hasCursorRangeKeys({ start: { key: 'a' } })).toBe(false)
    expect(hasCursorRangeKeys({ start: { key: 'a' }, end: { key: 'b' } })).toBe(true)
  })

  it('returns null when cursor blocks are missing', () => {
    const contentState = {
      getBlock: vi.fn((key: string) => key === 'a' ? { key } : null)
    }
    const cursorRange = {
      start: { key: 'a', offset: 0 },
      end: { key: 'b', offset: 1 }
    }

    expect(resolveCursorRangeBlocks(contentState as any, cursorRange)).toBeNull()
  })

  it('returns resolved cursor blocks when both edges still exist', () => {
    const startBlock = { key: 'a', text: 'foo' }
    const endBlock = { key: 'b', text: 'bar' }
    const contentState = {
      getBlock: vi.fn((key: string) => ({ a: startBlock, b: endBlock }[key] ?? null))
    }
    const cursorRange = {
      start: { key: 'a', offset: 1 },
      end: { key: 'b', offset: 2 }
    }

    expect(resolveCursorRangeBlocks(contentState as any, cursorRange)).toEqual({
      anchor: cursorRange.start,
      focus: cursorRange.end,
      start: cursorRange.start,
      end: cursorRange.end,
      startBlock,
      endBlock
    })
  })

  it('normalizes cursor ranges into a full anchor/focus/start/end shape', () => {
    expect(normalizeCursorRange({
      start: { key: 'a', offset: 1 },
      end: { key: 'b', offset: 2 }
    })).toEqual({
      anchor: { key: 'a', offset: 1 },
      focus: { key: 'b', offset: 2 },
      start: { key: 'a', offset: 1 },
      end: { key: 'b', offset: 2 }
    })
  })

  it('falls back to contentState.cursor when the live selection is stale', () => {
    const startBlock = { key: 'a', text: 'foo' }
    const endBlock = { key: 'b', text: 'bar' }
    const contentState = {
      cursor: {
        start: { key: 'a', offset: 1 },
        end: { key: 'b', offset: 2 }
      },
      getBlock: vi.fn((key: string) => ({ stale: null, a: startBlock, b: endBlock }[key] ?? null))
    }

    expect(resolveActiveCursorRange(contentState as any, {
      start: { key: 'stale', offset: 0 },
      end: { key: 'stale', offset: 0 }
    })).toEqual({
      anchor: contentState.cursor.start,
      focus: contentState.cursor.end,
      start: contentState.cursor.start,
      end: contentState.cursor.end,
      startBlock,
      endBlock
    })
  })
})
