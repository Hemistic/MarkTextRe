import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../../src/muya/lib/contentState/runtimeDomSupport', () => ({
  getContentStateContainer: vi.fn(contentState => contentState?.container ?? null),
  getContentStateEditor: vi.fn(contentState => contentState?.editor ?? null)
}))

import {
  captureRenderScrollAnchor,
  restoreRenderScrollAnchor
} from '../../../../../src/muya/lib/contentState/renderScrollAnchorSupport'

const createChild = (id, top, bottom) => ({
  nodeType: 1,
  id,
  getBoundingClientRect: () => ({ top, bottom })
})

describe('muya renderScrollAnchorSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures the first visible top-level block as the scroll anchor', () => {
    const editor = {
      children: [
        createChild('a', 20, 90),
        createChild('b', 110, 180),
        createChild('c', 190, 260)
      ]
    }
    const container = {
      getBoundingClientRect: () => ({ top: 100, bottom: 500 })
    }

    expect(captureRenderScrollAnchor({ container, editor })).toEqual({
      key: 'b',
      offsetTop: 10
    })
  })

  it('restores scrollTop to keep the same anchor block in place', () => {
    const anchor = createChild('b', 150, 220)
    const editor = {
      children: [
        createChild('a', 40, 110),
        anchor,
        createChild('c', 260, 330)
      ]
    }
    const container = {
      scrollTop: 300,
      scrollHeight: 1800,
      clientHeight: 400,
      getBoundingClientRect: () => ({ top: 100, bottom: 500 })
    }

    const restored = restoreRenderScrollAnchor(
      { container, editor },
      { key: 'b', offsetTop: 20 }
    )

    expect(restored).toBe(true)
    expect(container.scrollTop).toBe(330)
  })
})
