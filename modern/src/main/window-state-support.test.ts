import { describe, expect, it } from 'vitest'
import type { Display, Rectangle } from 'electron'
import {
  DEFAULT_WINDOW_BOUNDS,
  createWindowStateSnapshot,
  normalizeWindowBounds,
  parsePersistedWindowState
} from './window-state-support'

const displays = [
  {
    workArea: {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080
    }
  }
] as Display[]

describe('window-state-support', () => {
  it('normalizes bounds and keeps them when visible', () => {
    const bounds: Rectangle = {
      x: 10.4,
      y: 20.6,
      width: 800.1,
      height: 500.2
    }

    expect(normalizeWindowBounds(bounds, displays)).toEqual({
      x: 10,
      y: 21,
      width: 1024,
      height: 640
    })
  })

  it('falls back to the default bounds when the window would be off-screen', () => {
    const bounds: Rectangle = {
      x: 5000,
      y: 5000,
      width: 1200,
      height: 900
    }

    expect(normalizeWindowBounds(bounds, displays)).toEqual(DEFAULT_WINDOW_BOUNDS)
  })

  it('parses persisted state only when the stored shape is valid', () => {
    expect(
      parsePersistedWindowState(
        {
          bounds: {
            x: 40,
            y: 50,
            width: 1200,
            height: 900
          },
          isMaximized: true
        },
        displays
      )
    ).toEqual({
      bounds: {
        x: 40,
        y: 50,
        width: 1200,
        height: 900
      },
      isMaximized: true
    })

    expect(parsePersistedWindowState({ bounds: { x: 1 } }, displays)).toBeNull()
  })

  it('creates a persisted snapshot from the correct browser window bounds', () => {
    const snapshot = createWindowStateSnapshot({
      getBounds: () => ({
        x: 10,
        y: 20,
        width: 1300,
        height: 900
      }),
      getNormalBounds: () => ({
        x: 30,
        y: 40,
        width: 1500,
        height: 950
      }),
      isMaximized: () => true
    }, displays)

    expect(snapshot).toEqual({
      bounds: {
        x: 30,
        y: 40,
        width: 1500,
        height: 950
      },
      isMaximized: true
    })
  })
})
