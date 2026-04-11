import path from 'node:path'
import { promises as fs } from 'node:fs'
import { screen } from 'electron'
import type { BrowserWindow, Rectangle } from 'electron'
import { windowStatePath } from './paths'

interface PersistedWindowState {
  bounds: Rectangle
  isMaximized: boolean
}

const DEFAULT_WINDOW_BOUNDS: Rectangle = {
  width: 1360,
  height: 880,
  x: 120,
  y: 80
}

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

const isRectangle = (value: unknown): value is Rectangle => {
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

const isVisibleWithinDisplays = (bounds: Rectangle) => {
  return screen.getAllDisplays().some(display => {
    const area = display.workArea
    return !(
      bounds.x + bounds.width <= area.x ||
      bounds.y + bounds.height <= area.y ||
      bounds.x >= area.x + area.width ||
      bounds.y >= area.y + area.height
    )
  })
}

const normalizeWindowBounds = (bounds: Rectangle): Rectangle => {
  const width = Math.max(Math.round(bounds.width), 1024)
  const height = Math.max(Math.round(bounds.height), 640)
  const normalizedBounds = {
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width,
    height
  }

  return isVisibleWithinDisplays(normalizedBounds)
    ? normalizedBounds
    : DEFAULT_WINDOW_BOUNDS
}

const readWindowState = async (): Promise<PersistedWindowState | null> => {
  try {
    const raw = await fs.readFile(windowStatePath(), 'utf8')
    const parsed = JSON.parse(raw) as {
      bounds?: unknown
      isMaximized?: unknown
    }

    if (!isRectangle(parsed.bounds) || typeof parsed.isMaximized !== 'boolean') {
      return null
    }

    return {
      bounds: normalizeWindowBounds(parsed.bounds),
      isMaximized: parsed.isMaximized
    }
  } catch {
    return null
  }
}

const writeWindowState = async (state: PersistedWindowState) => {
  await fs.mkdir(path.dirname(windowStatePath()), { recursive: true })
  await fs.writeFile(windowStatePath(), JSON.stringify(state, null, 2), 'utf8')
}

export const getInitialWindowState = async () => {
  return (await readWindowState()) ?? {
    bounds: DEFAULT_WINDOW_BOUNDS,
    isMaximized: false
  }
}

export const installWindowStatePersistence = (window: BrowserWindow) => {
  let persistTimer: NodeJS.Timeout | null = null

  const schedulePersist = () => {
    if (persistTimer) {
      clearTimeout(persistTimer)
    }

    persistTimer = setTimeout(() => {
      persistTimer = null

      const bounds = window.isMaximized()
        ? window.getNormalBounds()
        : window.getBounds()

      void writeWindowState({
        bounds: normalizeWindowBounds(bounds),
        isMaximized: window.isMaximized()
      }).catch(error => {
        console.error('[main] failed to persist window state:', error)
      })
    }, 150)
  }

  window.on('resize', schedulePersist)
  window.on('move', schedulePersist)
  window.on('maximize', schedulePersist)
  window.on('unmaximize', schedulePersist)
  window.on('closed', () => {
    if (persistTimer) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
  })
}
