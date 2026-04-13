import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  ;(globalThis as any).window = (globalThis as any).window ?? {
    navigator: {
      platform: '',
      userAgent: ''
    }
  }
})

// @ts-ignore legacy Muya support test bridge is JS-backed on purpose.
import { applyCursorRangeSupport } from './legacyCursorRangeSupportTestApi'

describe('muya cursorRangeSupport', () => {
  it('returns an empty cursor instead of blurring when selection nodes are temporarily invalid', () => {
    class SelectionMock {
      doc: { getSelection: () => unknown }

      constructor (doc: { getSelection: () => unknown }) {
        this.doc = doc
      }
    }

    applyCursorRangeSupport(SelectionMock as any)

    const selection = new (SelectionMock as any)({
      getSelection: () => ({
        anchorNode: { nodeType: 1, closest: () => null },
        anchorOffset: 0,
        focusNode: { nodeType: 1, closest: () => null },
        focusOffset: 0
      })
    })

    expect(selection.getCursorRange()).toEqual({
      anchor: null,
      focus: null,
      start: null,
      end: null,
      noHistory: false
    })
  })

  it('accepts non-span ag-paragraph containers such as code blocks', () => {
    class SelectionMock {
      doc: unknown

      constructor (doc: unknown) {
        this.doc = doc
      }
    }

    applyCursorRangeSupport(SelectionMock as any)
    const paragraphNode = {
      nodeType: 1,
      closest: (selector: string) => selector === '.ag-paragraph' ? { id: 'code' } : null
    }
    const selection = new (SelectionMock as any)({ getSelection: () => ({}) })

    expect(selection.isValidCursorNode(paragraphNode)).toEqual({ id: 'code' })
  })
})
