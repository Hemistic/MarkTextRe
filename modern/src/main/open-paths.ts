import path from 'node:path'
import { promises as fs } from 'node:fs'
import { app } from 'electron'
import type { BrowserWindow } from 'electron'
import { legacyMainCommandAdapter } from './app-command-dispatcher'
import {
  enqueueUniquePath,
  extractOpenablePaths as extractOpenablePathsFromArgs
} from './open-path-support'
import {
  activateOpenPathWindow,
  attachPendingOpenPathFlush,
  ensureOpenPathWindow,
  flushPendingOpenPathsToWindow
} from './open-path-coordinator-support'
import {
  captureStartupOpenPaths,
  queueOpenPathForApp,
  registerOpenPathAppEvents
} from './open-path-runtime-support'

type AsyncWindowFactory = () => Promise<BrowserWindow>
type WindowGetter = () => BrowserWindow | null
type WindowSetter = (window: BrowserWindow) => void

interface OpenPathCoordinatorOptions {
  createWindow: AsyncWindowFactory
  getWindow: WindowGetter
  setWindow: WindowSetter
}

const commandAdapter = legacyMainCommandAdapter

export const createOpenPathCoordinator = ({
  createWindow,
  getWindow,
  setWindow
}: OpenPathCoordinatorOptions) => {
  const pendingOpenPaths: string[] = []

  const flushPendingOpenPaths = (window: BrowserWindow) => {
    flushPendingOpenPathsToWindow(pendingOpenPaths, window, (message, targetWindow) => {
      if (message.pathname) {
        commandAdapter.dispatchOpenPath(message.pathname, targetWindow)
      }
    })
  }

  const attachWindow = (window: BrowserWindow) => {
    attachPendingOpenPathFlush(window, () => flushPendingOpenPaths(window))
  }

  const ensureWindow = async () => {
    return ensureOpenPathWindow(getWindow, createWindow, setWindow)
  }

  const queueOpenPath = (pathname: string) => {
    queueOpenPathForApp(pendingOpenPaths, pathname, {
      activateWindow: activateOpenPathWindow,
      appReady: () => app.isReady(),
      attachWindow,
      ensureWindow,
      enqueuePath: enqueueUniquePath
    })
  }

  const extractOpenablePaths = async (argv: string[]) => {
    return extractOpenablePathsFromArgs(argv, {
      pathResolver: path.resolve,
      statPath: fs.stat
    })
  }

  const captureStartupPaths = async (argv: string[]) => {
    await captureStartupOpenPaths(argv, pendingOpenPaths, {
      enqueuePath: enqueueUniquePath,
      extractOpenablePaths
    })
  }

  const registerAppEventHandlers = () => {
    registerOpenPathAppEvents(app, {
      extractOpenablePaths,
      queueOpenPath
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
