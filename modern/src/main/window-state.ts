import path from 'node:path'
import { promises as fs } from 'node:fs'
import { screen } from 'electron'
import type { BrowserWindow } from 'electron'
import { windowStatePath } from './paths'
import {
  DEFAULT_WINDOW_BOUNDS,
  createWindowStateSnapshot,
  type PersistedWindowState,
  parsePersistedWindowState
} from './window-state-support'

const readWindowState = async (): Promise<PersistedWindowState | null> => {
  try {
    const raw = await fs.readFile(windowStatePath(), 'utf8')
    return parsePersistedWindowState(JSON.parse(raw), screen.getAllDisplays())
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

      void writeWindowState(
        createWindowStateSnapshot(window, screen.getAllDisplays())
      ).catch(error => {
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
