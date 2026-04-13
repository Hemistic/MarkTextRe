import { describe, expect, it, vi } from 'vitest'
import {
  findMuyaHeadingTarget,
  getMuyaScrollTopForTarget,
  scrollMuyaContainerToTarget,
  scrollMuyaToHeading
} from './navigation'

describe('muya navigation helpers', () => {
  it('tries heading selectors in order', () => {
    const heading = { id: 'intro' }
    const querySelector = vi
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(heading)

    expect(findMuyaHeadingTarget({ querySelector } as unknown as HTMLElement, 'intro')).toBe(heading)
    expect(querySelector).toHaveBeenNthCalledWith(1, '#intro')
    expect(querySelector).toHaveBeenNthCalledWith(2, '[id="intro"]')
  })

  it('computes the next scroll position with an offset', () => {
    const container = {
      scrollTop: 150,
      getBoundingClientRect: () => ({ top: 100 })
    }
    const target = {
      getBoundingClientRect: () => ({ top: 320 })
    }

    expect(getMuyaScrollTopForTarget(
      container as unknown as HTMLElement,
      target as unknown as HTMLElement
    )).toBe(290)
  })

  it('scrolls a container to the target', () => {
    const scrollTo = vi.fn()
    const container = {
      scrollTop: 50,
      scrollTo,
      getBoundingClientRect: () => ({ top: 20 })
    }
    const target = {
      getBoundingClientRect: () => ({ top: 180 })
    }

    scrollMuyaContainerToTarget(
      container as unknown as HTMLElement,
      target as unknown as HTMLElement
    )

    expect(scrollTo).toHaveBeenCalledWith({
      top: 130,
      behavior: 'smooth'
    })
  })

  it('returns false when heading navigation cannot resolve a target', () => {
    expect(scrollMuyaToHeading(null, 'intro')).toBe(false)
    expect(scrollMuyaToHeading({
      querySelector: vi.fn(() => null),
      scrollTop: 0,
      scrollTo: vi.fn(),
      getBoundingClientRect: () => ({ top: 0 })
    } as unknown as HTMLElement, 'intro')).toBe(false)
  })
})
