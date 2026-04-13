import type { BrowserWindow, Display, Rectangle } from 'electron'

export interface PersistedWindowState {
  bounds: Rectangle
  isMaximized: boolean
}

export const DEFAULT_WINDOW_BOUNDS: Rectangle = {
  width: 1360,
  height: 880,
  x: 120,
  y: 80
}

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

export const isRectangle = (value: unknown): value is Rectangle => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const rectangle = value as Record<string, unknown>
  return (
    isFiniteNumber(rectangle.x) &&
    isFiniteNumber(rectangle.y) &&
    isFiniteNumber(rectangle.width) &&
    isFiniteNumber(rectangle.height)
  )
}

export const isVisibleWithinDisplays = (bounds: Rectangle, displays: Display[]) => {
  return displays.some(display => {
    const area = display.workArea
    return !(
      bounds.x + bounds.width <= area.x ||
      bounds.y + bounds.height <= area.y ||
      bounds.x >= area.x + area.width ||
      bounds.y >= area.y + area.height
    )
  })
}

export const normalizeWindowBounds = (bounds: Rectangle, displays: Display[]): Rectangle => {
  const width = Math.max(Math.round(bounds.width), 1024)
  const height = Math.max(Math.round(bounds.height), 640)
  const normalizedBounds = {
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width,
    height
  }

  return isVisibleWithinDisplays(normalizedBounds, displays)
    ? normalizedBounds
    : DEFAULT_WINDOW_BOUNDS
}

export const parsePersistedWindowState = (
  value: unknown,
  displays: Display[]
): PersistedWindowState | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const parsed = value as {
    bounds?: unknown
    isMaximized?: unknown
  }

  if (!isRectangle(parsed.bounds) || typeof parsed.isMaximized !== 'boolean') {
    return null
  }

  return {
    bounds: normalizeWindowBounds(parsed.bounds, displays),
    isMaximized: parsed.isMaximized
  }
}

export const createWindowStateSnapshot = (
  window: Pick<BrowserWindow, 'getBounds' | 'getNormalBounds' | 'isMaximized'>,
  displays: Display[]
): PersistedWindowState => {
  const bounds = window.isMaximized()
    ? window.getNormalBounds()
    : window.getBounds()

  return {
    bounds: normalizeWindowBounds(bounds, displays),
    isMaximized: window.isMaximized()
  }
}
