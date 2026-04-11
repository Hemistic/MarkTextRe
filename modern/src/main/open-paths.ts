import path from 'node:path'
import { promises as fs } from 'node:fs'
import { app } from 'electron'
import type { BrowserWindow } from 'electron'
import { dispatchAppCommand } from './menu'

type WindowFactory = () => BrowserWindow
type AsyncWindowFactory = () => Promise<BrowserWindow>
type WindowGetter = () => BrowserWindow | null
type WindowSetter = (window: BrowserWindow) => void

interface OpenPathCoordinatorOptions {
  createWindow: AsyncWindowFactory
  getWindow: WindowGetter
  setWindow: WindowSetter
}

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd', '.txt'])

const enqueueUniquePath = (pendingOpenPaths: string[], pathname: string) => {
  if (!pendingOpenPaths.includes(pathname)) {
    pendingOpenPaths.push(pathname)
  }
}

export const createOpenPathCoordinator = ({
  createWindow,
  getWindow,
  setWindow
}: OpenPathCoordinatorOptions) => {
  const pendingOpenPaths: string[] = []

  const flushPendingOpenPaths = (window: BrowserWindow) => {
    if (pendingOpenPaths.length === 0) {
      return
    }

    const pathnames = pendingOpenPaths.splice(0, pendingOpenPaths.length)
    for (const pathname of pathnames) {
      dispatchAppCommand({
        command: 'open-path',
        pathname
      }, window)
    }
  }

  const attachWindow = (window: BrowserWindow) => {
    const flush = () => flushPendingOpenPaths(window)

    if (window.webContents.isLoadingMainFrame()) {
      window.webContents.once('did-finish-load', flush)
      return
    }

    flush()
  }

  const ensureWindow = async () => {
    const existingWindow = getWindow()
    if (existingWindow && !existingWindow.isDestroyed()) {
      return existingWindow
    }

    const nextWindow = await createWindow()
    setWindow(nextWindow)
    return nextWindow
  }

  const queueOpenPath = (pathname: string) => {
    enqueueUniquePath(pendingOpenPaths, pathname)

    if (!app.isReady()) {
      return
    }

    void ensureWindow().then(window => {
      if (window.isMinimized()) {
        window.restore()
      }
      window.focus()
      attachWindow(window)
    })
  }

  const normalizePathArgument = async (candidate: string) => {
    if (!candidate || candidate.startsWith('-')) {
      return null
    }

    const normalizedPath = path.resolve(candidate)
    if (!MARKDOWN_EXTENSIONS.has(path.extname(normalizedPath).toLowerCase())) {
      return null
    }

    try {
      const stat = await fs.stat(normalizedPath)
      return stat.isFile() ? normalizedPath : null
    } catch {
      return null
    }
  }

  const extractOpenablePaths = async (argv: string[]) => {
    const resolved = await Promise.all(argv.map(argument => normalizePathArgument(argument)))
    return resolved.filter((pathname): pathname is string => Boolean(pathname))
  }

  const captureStartupPaths = async (argv: string[]) => {
    const startupPaths = await extractOpenablePaths(argv)
    for (const pathname of startupPaths) {
      enqueueUniquePath(pendingOpenPaths, pathname)
    }
  }

  const registerAppEventHandlers = () => {
    app.on('second-instance', (_event, argv) => {
      void extractOpenablePaths(argv).then(pathnames => {
        for (const pathname of pathnames) {
          queueOpenPath(pathname)
        }
      })
    })

    app.on('open-file', (event, pathname) => {
      event.preventDefault()
      queueOpenPath(pathname)
    })
  }

  const acquireSingleInstanceLock = () => app.requestSingleInstanceLock()

  return {
    acquireSingleInstanceLock,
    attachWindow,
    captureStartupPaths,
    registerAppEventHandlers
  }
}
