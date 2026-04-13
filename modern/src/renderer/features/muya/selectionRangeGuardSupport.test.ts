import { describe, expect, it, vi } from 'vitest'
// @ts-ignore legacy Muya support test bridge is JS-backed on purpose.
import {
  canRestoreCursorRange,
  clampSelectionOffset,
  normalizeSelectionTargets,
  safeApplySelectionRange,
  safeSetSelectionFocus
} from './legacySelectionGuardTestApi'

describe('muya selectionRangeGuardSupport', () => {
  it('rejects cursor restore when paragraphs are missing or disconnected', () => {
    const cursorRange = {
      anchor: { key: 'a', offset: 1 },
      focus: { key: 'b', offset: 1 }
    }

    expect(canRestoreCursorRange(cursorRange, null, { nodeType: 1, isConnected: true })).toBe(false)
    expect(canRestoreCursorRange(cursorRange, { nodeType: 1, isConnected: false }, { nodeType: 1, isConnected: true })).toBe(false)
  })

  it('accepts legacy start/end-only cursor ranges for restoration guards', () => {
    const cursorRange = {
      start: { key: 'a', offset: 1 },
      end: { key: 'b', offset: 1 }
    }

    expect(canRestoreCursorRange(cursorRange, { nodeType: 1, isConnected: true }, { nodeType: 1, isConnected: true })).toBe(true)
  })

  it('clamps resolved selection offsets to available text length', () => {
    const anchorNode = { nodeType: 3, isConnected: true, textContent: 'abc' }
    const focusNode = { nodeType: 3, isConnected: true, textContent: 'xy' }
    const elementNode = {
      nodeType: 1,
      isConnected: true,
      childNodes: [{}, {}],
      textContent: 'abcdef'
    }

    expect(clampSelectionOffset(anchorNode, 10)).toBe(3)
    expect(clampSelectionOffset(elementNode, 10)).toBe(2)
    expect(normalizeSelectionTargets(anchorNode, 9, focusNode, 8)).toEqual({
      anchorNode,
      anchorOffset: 3,
      focusNode,
      focusOffset: 2
    })
  })

  it('applies and extends selection safely with fallbacks', () => {
    const removeAllRanges = vi.fn()
    const addRange = vi.fn()
    const selection = {
      removeAllRanges,
      addRange,
      extend: vi.fn(() => {
        throw new Error('extend failed')
      })
    }
    const range = {
      setStart: vi.fn(),
      collapse: vi.fn()
    }
    const doc = {
      createRange: vi.fn(() => range)
    }
    const focusNode = { nodeType: 3, isConnected: true, textContent: 'abc' }

    expect(safeApplySelectionRange(selection, range)).toBe(true)
    expect(removeAllRanges).toHaveBeenCalledTimes(1)
    expect(addRange).toHaveBeenCalledWith(range)

    const selectRange = vi.fn(() => true)
    expect(safeSetSelectionFocus(selection, focusNode, 2, doc, selectRange)).toBe(true)
    expect(range.setStart).toHaveBeenCalledWith(focusNode, 2)
    expect(selectRange).toHaveBeenCalledWith(range)
  })
})
