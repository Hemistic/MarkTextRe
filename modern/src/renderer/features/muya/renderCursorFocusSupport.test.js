import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../../src/muya/lib/selection', () => ({
  default: {
    getSelectionRange: vi.fn()
  }
}))

vi.mock('../../../../../src/muya/lib/selection/dom', () => ({
  findNearestParagraph: vi.fn(() => null)
}))

vi.mock('../../../../../src/muya/lib/contentState/runtimeDomSupport', () => ({
  getContentStateContainer: vi.fn(contentState => contentState?.container ?? null),
  getContentStateEditor: vi.fn(contentState => contentState?.editor ?? null),
  getContentStateWindow: vi.fn(() => null)
}))

import selection from '../../../../../src/muya/lib/selection'
import { preserveCursorScroll } from '../../../../../src/muya/lib/contentState/renderCursorFocusSupport'

describe('muya renderCursorFocusSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not touch scroll when the caret already stays visible', () => {
    vi.mocked(selection.getSelectionRange).mockReturnValue({
      getClientRects: () => [{
        top: 220,
        bottom: 242,
        height: 22
      }]
    })

    const container = {
      scrollTop: 300,
      scrollHeight: 1200,
      clientHeight: 400,
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 500
      })
    }

    const result = preserveCursorScroll({ container }, 260)

    expect(result).toBe(false)
    expect(container.scrollTop).toBe(300)
  })

  it('scrolls down when the restored caret would fall below the viewport', () => {
    vi.mocked(selection.getSelectionRange).mockReturnValue({
      getClientRects: () => [{
        top: 520,
        bottom: 560,
        height: 24
      }]
    })

    const container = {
      scrollTop: 240,
      scrollHeight: 1600,
      clientHeight: 400,
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 500
      })
    }

    const result = preserveCursorScroll({ container }, 240)

    expect(result).toBe(true)
    expect(container.scrollTop).toBe(306)
  })

  it('does not force scroll changes when no caret rect is available', () => {
    vi.mocked(selection.getSelectionRange).mockReturnValue(null)

    const container = {
      scrollTop: 180,
      scrollHeight: 900,
      clientHeight: 400,
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 500
      })
    }

    const result = preserveCursorScroll({ container }, 120)

    expect(result).toBe(false)
    expect(container.scrollTop).toBe(180)
  })
})
